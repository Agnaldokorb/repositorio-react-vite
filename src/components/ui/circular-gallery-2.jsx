import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const vertex = `
  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpeed;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;

    p.z += sin(p.x * 5.0 + uTime)
      * cos(p.y * 4.0 + uTime)
      * uSpeed * 0.12;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = `
  precision highp float;

  uniform sampler2D tMap;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform float uRadius;

  varying vec2 vUv;

  void main() {
    float imageAspect = uImageSize.x / uImageSize.y;
    float planeAspect = uPlaneSize.x / uPlaneSize.y;

    vec2 ratio = vec2(
      min(planeAspect / imageAspect, 1.0),
      min(imageAspect / planeAspect, 1.0)
    );

    vec2 imageUv = (vUv - 0.5) * ratio + 0.5;
    vec4 color = texture2D(tMap, imageUv);

    vec2 q = abs(vUv - 0.5) - vec2(0.5 - uRadius);
    float distance = length(max(q, 0.0))
      + min(max(q.x, q.y), 0.0)
      - uRadius;

    float alpha = 1.0 - smoothstep(-0.003, 0.003, distance);

    gl_FragColor = vec4(color.rgb, color.a * alpha);
  }
`;

function modulo(value, total) {
  return ((value % total) + total) % total;
}

function createGallery(container, items, options) {
  const {
    bend,
    borderRadius,
    scrollEase,
    scrollSpeed,
    onReady,
    onChange,
    onError,
  } = options;

  const renderer = new Renderer({
    alpha: true,
    antialias: false,
    dpr: Math.min(window.devicePixelRatio || 1, 1.5),
  });

  const gl = renderer.gl;

  if (!gl) {
    throw new Error("WebGL indisponível.");
  }

  const canvas = gl.canvas;
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  container.appendChild(canvas);
  gl.clearColor(0, 0, 0, 0);

  const camera = new Camera(gl, { fov: 45 });
  camera.position.z = 20;

  const scene = new Transform();
  const geometry = new Plane(gl, {
    widthSegments: 20,
    heightSegments: 12,
  });

  const textures = [];
  const programs = [];
  const imageElements = [];
  const meshes = [];

  let disposed = false;
  let loaded = 0;
  let frame = 0;
  let previousTime = 0;
  let visible = false;
  let ready = false;

  let current = 0;
  let target = 0;
  let activeIndex = -1;

  let viewportWidth = 1;
  let itemWidth = 1;
  let itemHeight = 1;
  let spacing = 1;

  let pointerId = null;
  let startX = 0;
  let startTarget = 0;

  const ease = Math.min(0.3, Math.max(0.01, scrollEase));
  const speed = Math.min(3, Math.max(0.3, scrollSpeed));
  const curvature = Math.min(4, Math.max(-4, bend));

  // Mais cópias evitam espaços vazios quando há poucas imagens.
  const copies = Math.max(2, Math.ceil(8 / items.length));
  const total = copies * items.length;

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    previousTime = 0;
  }

  function fail() {
    if (disposed) return;
    stop();
    onError();
  }

  function render(time) {
    frame = 0;

    if (disposed || !visible || document.hidden || !ready) return;

    const elapsed = previousTime
      ? Math.min((time - previousTime) / 1000, 0.05)
      : 1 / 60;

    previousTime = time;

    const previous = current;
    const factor = 1 - Math.pow(1 - ease, elapsed * 60);

    current += (target - current) * factor;

    if (Math.abs(target - current) < 0.0001) {
      current = target;
    }

    const movement = Math.min(
      1,
      Math.abs(current - previous) / Math.max(elapsed, 0.001),
    );

    const cycleWidth = total * spacing;

    meshes.forEach((mesh, index) => {
      const x =
        modulo(
          index * spacing - current * spacing + cycleWidth / 2,
          cycleWidth,
        ) -
        cycleWidth / 2;

      const normalizedX = x / Math.max(viewportWidth / 2, 1);

      mesh.position.x = x;
      mesh.position.y = -curvature * normalizedX * normalizedX;
      mesh.rotation.z = -Math.atan(
        (2 * curvature * normalizedX) / Math.max(viewportWidth / 2, 1),
      );

      mesh.program.uniforms.uTime.value = time / 1000;
      mesh.program.uniforms.uSpeed.value = movement;
    });

    const nextIndex = modulo(Math.round(current), items.length);

    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      onChange(nextIndex);
    }

    try {
      renderer.render({ scene, camera });
    } catch {
      fail();
      return;
    }

    if (pointerId !== null || Math.abs(target - current) > 0.0001) {
      frame = requestAnimationFrame(render);
    }
  }

  function start() {
    if (disposed || frame || !visible || document.hidden || !ready) {
      return;
    }

    frame = requestAnimationFrame(render);
  }

  function resize() {
    if (disposed) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    renderer.setSize(width, height);
    camera.perspective({ aspect: width / height });

    const viewportHeight =
      2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;

    viewportWidth = viewportHeight * camera.aspect;

    // Formato horizontal adequado para capturas de projetos.
    const pixelWidth = Math.min(width * 0.78, 560, height * 1.25);

    itemWidth = (pixelWidth / width) * viewportWidth;
    itemHeight = itemWidth / (16 / 10);
    spacing = itemWidth + viewportWidth * 0.055;

    meshes.forEach((mesh) => {
      mesh.scale.set(itemWidth, itemHeight, 1);
      mesh.program.uniforms.uPlaneSize.value = [itemWidth, itemHeight];
    });

    start();
  }

  function move(direction) {
    target = Math.round(target) + direction;
    start();
  }

  function pointerDown(event) {
    if (!ready || !event.isPrimary || event.button !== 0) return;

    pointerId = event.pointerId;
    startX = event.clientX;
    startTarget = current;
    target = current;

    container.setPointerCapture(event.pointerId);
    start();
  }

  function pointerMove(event) {
    if (event.pointerId !== pointerId) return;

    const width = Math.max(container.clientWidth, 1);
    const distance = (startX - event.clientX) / width;

    target = startTarget + distance * (viewportWidth / spacing) * speed;
    start();
  }

  function pointerEnd(event) {
    if (event.pointerId !== pointerId) return;

    pointerId = null;
    target = Math.round(target);

    if (container.hasPointerCapture(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }

    start();
  }

  function visibilityChange() {
    if (document.hidden) stop();
    else start();
  }

  function contextLost(event) {
    event.preventDefault();
    fail();
  }

  const resizeObserver = new ResizeObserver(resize);
  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    },
    { threshold: 0 },
  );

  function destroy() {
    if (disposed) return;

    disposed = true;
    stop();

    resizeObserver.disconnect();
    intersectionObserver.disconnect();

    document.removeEventListener("visibilitychange", visibilityChange);
    canvas.removeEventListener("webglcontextlost", contextLost);

    container.removeEventListener("pointerdown", pointerDown);
    container.removeEventListener("pointermove", pointerMove);
    container.removeEventListener("pointerup", pointerEnd);
    container.removeEventListener("pointercancel", pointerEnd);
    container.removeEventListener("lostpointercapture", pointerEnd);

    if (pointerId !== null && container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId);
    }

    imageElements.forEach((image) => {
      image.onload = null;
      image.onerror = null;
    });

    meshes.forEach((mesh) => mesh.setParent(null));
    programs.forEach((program) => program.remove());
    textures.forEach((texture) => gl.deleteTexture(texture.texture));
    geometry.remove();

    canvas.remove();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  }

  try {
    items.forEach((item) => {
      const texture = new Texture(gl, {
        generateMipmaps: false,
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR,
      });

      textures.push(texture);

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";

      image.onload = () => {
        if (disposed) return;

        texture.image = image;

        programs.forEach((program) => {
          if (program.uniforms.tMap.value === texture) {
            program.uniforms.uImageSize.value = [
              image.naturalWidth,
              image.naturalHeight,
            ];
          }
        });

        loaded += 1;

        if (loaded === items.length) {
          ready = true;
          onReady();
          start();
        }
      };

      image.onerror = fail;

      imageElements.push(image);
    });

    for (let index = 0; index < total; index += 1) {
      const texture = textures[index % items.length];

      const program = new Program(gl, {
        vertex,
        fragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        cullFace: null,
        uniforms: {
          tMap: { value: texture },
          uImageSize: { value: [1, 1] },
          uPlaneSize: { value: [1, 1] },
          uRadius: {
            value: Math.min(0.45, Math.max(0, borderRadius)),
          },
          uTime: { value: 0 },
          uSpeed: { value: 0 },
        },
      });

      programs.push(program);

      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);
      meshes.push(mesh);
    }

    resize();

    resizeObserver.observe(container);
    intersectionObserver.observe(container);

    document.addEventListener("visibilitychange", visibilityChange);
    canvas.addEventListener("webglcontextlost", contextLost);

    container.addEventListener("pointerdown", pointerDown);
    container.addEventListener("pointermove", pointerMove);
    container.addEventListener("pointerup", pointerEnd);
    container.addEventListener("pointercancel", pointerEnd);
    container.addEventListener("lostpointercapture", pointerEnd);

    imageElements.forEach((image, index) => {
      image.src = items[index].image;
    });
  } catch (error) {
    destroy();
    throw error;
  }

  return { move, destroy };
}

export function CircularGallery({
  items,
  bend = 1.5,
  borderRadius = 0.05,
  scrollSpeed = 1,
  scrollEase = 0.06,
  className,
}) {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  const [status, setStatus] = useState("loading");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items.length) return;

    let disposed = false;
    let controller;

    function handleError() {
      if (disposed) return;

      controller?.destroy();
      controllerRef.current = null;
      setStatus("error");
    }

    // Inicialização após a montagem do elemento.
    const initialization = requestAnimationFrame(() => {
      if (disposed) return;

      setStatus("loading");

      try {
        controller = createGallery(container, items, {
          bend,
          borderRadius,
          scrollSpeed,
          scrollEase,
          onReady: () => {
            if (!disposed) setStatus("ready");
          },
          onChange: (index) => {
            if (!disposed) setActiveIndex(index);
          },
          onError: handleError,
        });

        controllerRef.current = controller;
      } catch {
        handleError();
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(initialization);
      controller?.destroy();
      controllerRef.current = null;
    };
  }, [items, bend, borderRadius, scrollSpeed, scrollEase]);

  function move(direction) {
    controllerRef.current?.move(direction);
  }

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  const activeItem = items[activeIndex] || items[0];

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative", status === "error" && "hidden")}>
        <div
          ref={containerRef}
          role="group"
          aria-label="Galeria interativa. Use as setas para navegar."
          tabIndex={status === "ready" ? 0 : -1}
          onKeyDown={handleKeyDown}
          className="h-[340px] w-full cursor-grab touch-pan-y overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:cursor-grabbing sm:h-[440px] lg:h-[520px]"
        />

        {status === "loading" && (
          <p
            role="status"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-foreground"
          >
            Carregando imagens...
          </p>
        )}
      </div>

      {status === "ready" && (
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-4 pb-6">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Imagem anterior"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>

          <div className="min-w-0 text-center">
            <p className="text-base font-semibold text-foreground sm:text-lg">
              {activeItem?.text}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {activeIndex + 1} de {items.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Próxima imagem"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <ArrowRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}

      <ul
        aria-label="Imagens do projeto"
        className={
          status === "error" ? "grid gap-6 px-4 sm:grid-cols-2" : "sr-only"
        }
      >
        {items.map((item, index) => (
          <li key={`${item.image}-${index}`}>
            {status === "error" && (
              <img
                src={item.image}
                alt={item.alt || item.text}
                loading="lazy"
                decoding="async"
                className="aspect-video w-full rounded-xl border border-border bg-card object-contain"
              />
            )}

            <p className="mt-2 text-sm text-foreground">{item.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
