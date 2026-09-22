import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { MotionSubtitle } from "@/components/unlumen-ui/motion-subtitle";

gsap.registerPlugin(ScrollTrigger);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function shortestAngleDistance(a, b) {
  const full = Math.PI * 2;
  const raw = ((a - b + Math.PI) % full) - Math.PI;
  const normalized = raw < -Math.PI ? raw + full : raw;

  return Math.abs(normalized);
}

function applyScrollSensitivity(progress, sensitivity) {
  const safeSensitivity = clamp(sensitivity, 0.25, 1.6);

  return Math.pow(clamp(progress, 0, 1), 1 / safeSensitivity);
}

function getFocusedImageIndex(
  progress,
  total,
  turns,
  currentIndex,
  hysteresis = 0.18,
) {
  if (total <= 0 || turns <= 0) return 0;

  const phaseRaw = total * (0.25 + progress * turns);
  const phase = ((phaseRaw % total) + total) % total;

  if (currentIndex < 0) {
    return Math.round(phase) % total;
  }

  let next = currentIndex;
  let delta = phase - next;

  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;

  const threshold = 0.5 + clamp(hysteresis, 0, 0.35);

  while (delta > threshold) {
    next = (next + 1) % total;
    delta -= 1;
  }

  while (delta < -threshold) {
    next = (next - 1 + total) % total;
    delta += 1;
  }

  return next;
}

function getSnapProgressForIndex(index, total, turns, currentProgress) {
  if (total <= 0 || turns <= 0) {
    return clamp(currentProgress, 0, 1);
  }

  const safeIndex = ((index % total) + total) % total;
  const minCycle = Math.floor(-turns - 2);
  const maxCycle = Math.ceil(turns + 2);

  let nearest = clamp(currentProgress, 0, 1);
  let minDistance = Number.POSITIVE_INFINITY;

  for (let cycle = minCycle; cycle <= maxCycle; cycle += 1) {
    const progress = (safeIndex / total - 0.25 - cycle) / turns;

    if (progress < 0 || progress > 1) continue;

    const distance = Math.abs(progress - currentProgress);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = progress;
    }
  }

  if (!Number.isFinite(minDistance)) {
    return clamp((safeIndex / total - 0.25) / turns, 0, 1);
  }

  return nearest;
}

export function OrbitalImageWheel({
  images,
  turns = 4,
  blur = 4,
  dim = 40,
  brightnessBoost = 30,
  darknessStrength = 1.05,
  minSaturation = 55,
  saturationStrength = 0.6,
  focusSpread = 0.34,
  scaleEffect = 0.06,
  scrollSensitivity = 0.7,
  itemWidth = 220,
  itemHeight = 300,
  wheelSize,
  cropRatio = 0.75,
  scrollLength = 330,
  captionOffset = 15,
  showCaption = true,
  subtitleDirection = "top",
  subtitleSpeed = 1,
  subtitleStagger = 0.018,
  scrollContainerRef,
  className,
}) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const wheelRef = useRef(null);
  const wheelScrollTriggerRef = useRef(null);
  const titleClickTweenRef = useRef(null);

  const titleViewportRef = useRef(null);
  const titleTrackRef = useRef(null);
  const titleStartSpacerRef = useRef(null);
  const titleEndSpacerRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1200);

  const boundedTurns = clamp(turns, 0.2, 4);
  const boundedBlur = clamp(blur, 0, 36);
  const boundedDim = clamp(dim, 0, 100);
  const boundedBrightnessBoost = clamp(brightnessBoost, 0, 120);
  const boundedDarknessStrength = clamp(darknessStrength, 0.2, 3);
  const boundedMinSaturation = clamp(minSaturation, 0, 100);
  const boundedSaturationStrength = clamp(saturationStrength, 0.2, 3);
  const boundedFocusSpread = clamp(focusSpread, 0.08, 0.8);
  const boundedScaleEffect = clamp(scaleEffect, 0, 0.3);
  const boundedScrollSensitivity = clamp(scrollSensitivity, 0.25, 1.6);
  const boundedItemWidth = clamp(itemWidth, 140, 520);
  const boundedItemHeight = clamp(itemHeight, 180, 620);
  const boundedCropRatio = clamp(cropRatio, 0.2, 0.8);
  const boundedScrollLength = clamp(scrollLength, 180, 700);
  const boundedCaptionOffset = clamp(captionOffset, 2, 22);
  const boundedSubtitleSpeed = clamp(subtitleSpeed, 0.3, 3);
  const boundedSubtitleStagger = clamp(subtitleStagger, 0, 0.08);

  const boundedSubtitleDirection =
    subtitleDirection === "bottom" ? "bottom" : "top";

  const responsiveWheelSize = clamp(viewportWidth * 1.65, 900, 2400);
  const boundedWheelSize = clamp(wheelSize ?? responsiveWheelSize, 700, 2600);
  const radius = boundedWheelSize / 2;

  const titleLabels = useMemo(
    () =>
      images.map(
        (image, index) => image.label || image.alt || `Imagem ${index + 1}`,
      ),
    [images],
  );

  const activeTitleIndex = Math.max(
    0,
    Math.min(activeIndex, titleLabels.length - 1),
  );

  const activeImage = images[activeTitleIndex] ?? null;

  // Mede a área disponível e acompanha mudanças de tamanho.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      setViewportWidth(viewport.clientWidth || 1200);
    });

    observer.observe(viewport);

    return () => observer.disconnect();
  }, [images.length]);

  const handleTitleClick = useCallback(
    (index) => {
      const trigger = wheelScrollTriggerRef.current;
      if (!trigger || images.length === 0) return;

      const currentProgress = clamp(trigger.progress, 0, 1);

      const currentWheelProgress = applyScrollSensitivity(
        currentProgress,
        boundedScrollSensitivity,
      );

      const targetWheelProgress = getSnapProgressForIndex(
        index,
        images.length,
        boundedTurns,
        currentWheelProgress,
      );

      // Converte a posição da roda para a posição real da rolagem.
      const targetProgress = Math.pow(
        targetWheelProgress,
        boundedScrollSensitivity,
      );

      const scrollRange = trigger.end - trigger.start;
      if (scrollRange <= 0) return;

      titleClickTweenRef.current?.kill();

      const proxy = { scroll: trigger.scroll() };

      titleClickTweenRef.current = gsap.to(proxy, {
        scroll: trigger.start + targetProgress * scrollRange,
        duration: 0.58,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          trigger.scroll(proxy.scroll);
        },
      });
    },
    [images.length, boundedTurns, boundedScrollSensitivity],
  );

  // Posiciona as imagens e vincula a roda à rolagem.
  useEffect(() => {
    const section = sectionRef.current;
    const wheel = wheelRef.current;

    if (!section || !wheel || images.length === 0) return;

    let previousActive = -1;

    const context = gsap.context(() => {
      const cards = Array.from(wheel.querySelectorAll(".oiw-item"));
      if (cards.length === 0) return;

      const topAnchor = -Math.PI / 2;
      const focusArc = Math.PI * boundedFocusSpread;

      function applyState(rawProgress) {
        const progress = applyScrollSensitivity(
          rawProgress,
          boundedScrollSensitivity,
        );

        const rotation = -progress * boundedTurns * Math.PI * 2;

        const focusedIndex = getFocusedImageIndex(
          progress,
          cards.length,
          boundedTurns,
          previousActive,
        );

        cards.forEach((card, index) => {
          const base = (index / cards.length) * Math.PI * 2 - Math.PI;
          const theta = base + rotation;

          const x = Math.cos(theta) * radius;
          const y = Math.sin(theta) * radius;

          const distanceToFocus = shortestAngleDistance(theta, topAnchor);
          const focusIntensity = clamp(distanceToFocus / focusArc, 0, 1);

          const darkIntensity = clamp(
            focusIntensity * boundedDarknessStrength,
            0,
            1,
          );

          const saturationIntensity = clamp(
            focusIntensity * boundedSaturationStrength,
            0,
            1,
          );

          const currentBlur = darkIntensity * boundedBlur;
          const peakBrightness = clamp(100 + boundedBrightnessBoost, 100, 220);

          const currentBrightness =
            boundedDim + (1 - darkIntensity) * (peakBrightness - boundedDim);

          const currentSaturation =
            boundedMinSaturation +
            (1 - saturationIntensity) * (100 - boundedMinSaturation);

          const currentScale = 1 - darkIntensity * boundedScaleEffect;
          const tilt = clamp(x / radius, -1, 1) * 8;
          const depth = clamp((1 - focusIntensity) * 100, 0, 100);

          gsap.set(card, {
            x,
            y,
            xPercent: -50,
            yPercent: -50,
            z: depth,
            rotate: tilt,
            scale: currentScale,
            filter:
              `blur(${currentBlur}px) ` +
              `brightness(${currentBrightness}%) ` +
              `saturate(${currentSaturation}%)`,
            zIndex: Math.round(depth),
          });
        });

        if (focusedIndex !== previousActive) {
          previousActive = focusedIndex;
          setActiveIndex(focusedIndex);
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        scroller: scrollContainerRef?.current ?? undefined,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => applyState(self.progress),
        onRefresh: (self) => applyState(self.progress),
      });

      wheelScrollTriggerRef.current = trigger;
    }, section);

    return () => {
      titleClickTweenRef.current?.kill();
      titleClickTweenRef.current = null;
      wheelScrollTriggerRef.current = null;
      context.revert();
    };
  }, [
    scrollContainerRef,
    images,
    radius,
    boundedTurns,
    boundedBlur,
    boundedDim,
    boundedBrightnessBoost,
    boundedDarknessStrength,
    boundedMinSaturation,
    boundedSaturationStrength,
    boundedFocusSpread,
    boundedScaleEffect,
    boundedScrollSensitivity,
    boundedScrollLength,
  ]);

  // Centraliza a legenda ativa.
  useLayoutEffect(() => {
    const viewport = titleViewportRef.current;
    const track = titleTrackRef.current;
    const startSpacer = titleStartSpacerRef.current;
    const endSpacer = titleEndSpacerRef.current;

    if (!viewport || !track || titleLabels.length === 0) return;

    const firstTitle = track.querySelector('[data-title-index="0"]');

    const lastTitle = track.querySelector(
      `[data-title-index="${titleLabels.length - 1}"]`,
    );

    const activeTitle = track.querySelector(
      `[data-title-index="${activeTitleIndex}"]`,
    );

    if (!activeTitle || !firstTitle || !lastTitle) return;

    const availableWidth = viewport.clientWidth;

    if (startSpacer) {
      startSpacer.style.width = `${Math.max(
        0,
        availableWidth / 2 - firstTitle.offsetWidth / 2,
      )}px`;
    }

    if (endSpacer) {
      endSpacer.style.width = `${Math.max(
        0,
        availableWidth / 2 - lastTitle.offsetWidth / 2,
      )}px`;
    }

    const activeCenter = activeTitle.offsetLeft + activeTitle.offsetWidth / 2;

    let targetX = Math.round(availableWidth / 2 - activeCenter);

    if (track.scrollWidth <= availableWidth) {
      targetX = Math.round((availableWidth - track.scrollWidth) / 2);
    } else {
      targetX = Math.round(
        clamp(targetX, availableWidth - track.scrollWidth, 0),
      );
    }

    const tween = gsap.to(track, {
      x: targetX,
      duration: 0.62,
      ease: "power4.out",
      overwrite: true,
    });

    return () => tween.kill();
  }, [activeTitleIndex, titleLabels, viewportWidth, showCaption]);

  if (images.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Galeria de imagens do projeto"
      className={cn("relative w-full", className)}
      style={{ height: `${boundedScrollLength}vh` }}
    >
      <div
        ref={viewportRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        <div
          ref={wheelRef}
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: boundedWheelSize,
            height: boundedWheelSize,
            bottom: `-${boundedWheelSize * boundedCropRatio}px`,
          }}
        >
          <div
            className="relative h-full w-full"
            style={{ perspective: "1200px" }}
          >
            {images.map((image, index) => (
              <figure
                key={`${image.src}-${index}`}
                className="oiw-item absolute left-1/2 top-1/2 m-0 overflow-hidden rounded-xl border border-border bg-muted"
                style={{
                  width: boundedItemWidth,
                  height: boundedItemHeight,
                }}
              >
                <img
                  src={image.src}
                  alt={image.alt || image.label || `Imagem ${index + 1}`}
                  width={boundedItemWidth}
                  height={boundedItemHeight}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </figure>
            ))}
          </div>
        </div>

        {showCaption && activeImage && (
          <div
            className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
            style={{ bottom: `${boundedCaptionOffset}vh` }}
          >
            <div className="min-w-0 px-4 text-center">
              <MotionSubtitle
                text={
                  activeImage.subtitle ||
                  activeImage.alt ||
                  "Detalhes do projeto"
                }
                direction={boundedSubtitleDirection}
                speed={boundedSubtitleSpeed}
                stagger={boundedSubtitleStagger}
                className="mb-3 text-sm tracking-wide text-foreground/80"
              />

              <div
                ref={titleViewportRef}
                className="pointer-events-auto mx-auto w-[min(84vw,760px)] overflow-hidden py-2"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 14%, black 86%, transparent)",
                  maskImage:
                    "linear-gradient(to right, transparent, black 14%, black 86%, transparent)",
                }}
              >
                <div ref={titleTrackRef} className="flex w-max items-center">
                  <span
                    ref={titleStartSpacerRef}
                    aria-hidden="true"
                    className="block h-px shrink-0"
                  />

                  {titleLabels.map((title, index) => {
                    const distance = Math.abs(index - activeTitleIndex);

                    return (
                      <button
                        key={`${title}-${index}`}
                        type="button"
                        data-title-index={index}
                        onClick={() => handleTitleClick(index)}
                        aria-label={`Mostrar imagem: ${title}`}
                        aria-current={
                          index === activeTitleIndex ? "true" : undefined
                        }
                        style={{
                          opacity:
                            distance === 0 ? 1 : distance === 1 ? 0.65 : 0.4,
                        }}
                        className={cn(
                          "mr-3 inline-flex min-h-11 shrink-0 items-center",
                          "justify-center whitespace-nowrap rounded-full",
                          "border bg-background/80 px-6 py-2 text-base font-medium",
                          "backdrop-blur-sm transition-colors sm:text-xl",
                          "focus-visible:outline-2 focus-visible:outline-offset-2",
                          "focus-visible:outline-ring",
                          index === activeTitleIndex
                            ? "border-foreground/50 text-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {title}
                      </button>
                    );
                  })}

                  <span
                    ref={titleEndSpacerRef}
                    aria-hidden="true"
                    className="block h-px shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrbitalImageWheel;
