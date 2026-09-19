import { useEffect, useRef, useState } from "react";
import { ArrowRight, Smartphone } from "lucide-react";

const limit = (value, min, max) => Math.min(max, Math.max(min, value));

export default function ProjectsIntro({ onFinish }) {
  const dialogRef = useRef(null);
  const sceneRef = useRef(null);

  const [count, setCount] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionMessage, setMotionMessage] = useState("");

  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Abre a introdução e impede interação com o conteúdo atrás dela.
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Primeiro mostra a apresentação; depois inicia a contagem.
  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setTimeout(() => {
      setCount(5);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  // Mantém cada número visível por um segundo, incluindo o zero.
  useEffect(() => {
    if (count === null || reducedMotion) return;

    const timer = window.setTimeout(() => {
      if (count === 0) {
        onFinish();
      } else {
        setCount(count - 1);
      }
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [count, onFinish, reducedMotion]);

  // A primeira leitura define a posição neutra do celular.
  useEffect(() => {
    if (!motionEnabled || reducedMotion) return;

    let initialBeta = null;
    let initialGamma = null;

    function handleOrientation(event) {
      if (event.beta === null || event.gamma === null) return;

      if (initialBeta === null || initialGamma === null) {
        initialBeta = event.beta;
        initialGamma = event.gamma;
      }

      const rotateX = limit((event.beta - initialBeta) * -0.3, -8, 8);
      const rotateY = limit((event.gamma - initialGamma) * 0.3, -10, 10);

      sceneRef.current?.style.setProperty("--rotate-x", `${rotateX}deg`);
      sceneRef.current?.style.setProperty("--rotate-y", `${rotateY}deg`);
    }

    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [motionEnabled, reducedMotion]);

  function handlePointerMove(event) {
    if (reducedMotion || motionEnabled) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    sceneRef.current?.style.setProperty(
      "--rotate-x",
      `${limit(-y * 12, -6, 6)}deg`,
    );

    sceneRef.current?.style.setProperty(
      "--rotate-y",
      `${limit(x * 16, -8, 8)}deg`,
    );
  }

  function resetPosition() {
    if (motionEnabled) return;

    sceneRef.current?.style.setProperty("--rotate-x", "0deg");
    sceneRef.current?.style.setProperty("--rotate-y", "0deg");
  }

  async function enableMotion() {
    const orientation = window.DeviceOrientationEvent;

    if (!window.isSecureContext || !orientation) {
      setMotionMessage("Use o toque para explorar o efeito.");
      return;
    }

    try {
      if (typeof orientation.requestPermission === "function") {
        const permission = await orientation.requestPermission();

        if (permission !== "granted") {
          setMotionMessage("Você pode explorar o efeito pelo toque.");
          return;
        }
      }

      setMotionEnabled(true);
      setMotionMessage("Incline suavemente o celular.");
    } catch {
      setMotionMessage("Use o toque para explorar o efeito.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="projects-intro-title"
      onCancel={(event) => {
        event.preventDefault();
        onFinish();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto border-0 bg-[#080811] p-0 text-white backdrop:bg-black"
    >
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPosition}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") resetPosition();
        }}
        onPointerCancel={resetPosition}
        className="relative isolate flex min-h-full flex-col overflow-hidden"
      >
        {/* Fundo decorativo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-violet-600/25 blur-[100px] sm:size-[32rem]" />

          <div className="absolute bottom-0 right-0 size-64 rounded-full bg-cyan-500/10 blur-[90px]" />

          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-10">
          <span className="text-sm font-semibold tracking-[0.2em]">
            AK<span className="text-violet-400">.</span>
          </span>

          <button
            type="button"
            onClick={onFinish}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
          >
            {reducedMotion ? "Ver projetos" : "Pular introdução"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div
          className="flex flex-1 items-center justify-center px-6 py-10 sm:px-12"
          style={{ perspective: "1000px" }}
        >
          <div
            ref={sceneRef}
            className="relative w-full max-w-4xl text-center transition-transform duration-200 ease-out motion-reduce:transform-none motion-reduce:transition-none"
            style={{
              transform:
                "rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[2rem] border border-white/10 sm:-inset-10"
              style={{ transform: "translateZ(-60px)" }}
            />

            <p
              className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-violet-300 sm:text-sm"
              style={{ transform: "translateZ(30px)" }}
            >
              Ideias transformadas em projetos
            </p>

            <h1
              id="projects-intro-title"
              className={
                count === null
                  ? "text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
                  : "sr-only"
              }
              style={{ transform: "translateZ(70px)" }}
            >
              Você está prestes a conhecer{" "}
              <span className="text-violet-400">meus trabalhos.</span>
            </h1>

            {count !== null && (
              <div style={{ transform: "translateZ(90px)" }}>
                <p className="sr-only" role="status">
                  Apresentação em andamento. Você pode pular a introdução.
                </p>

                <span
                  key={count}
                  aria-hidden="true"
                  className="projects-intro-number block text-[clamp(7rem,28vw,16rem)] font-black leading-none tracking-tighter text-white"
                >
                  {count}
                </span>

                <p className="mt-6 text-sm tracking-wide text-white/60">
                  Um pouco do que eu construí.
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-col items-center gap-3 px-6 py-6 text-center">
          {!reducedMotion && (
            <>
              <p className="text-xs text-white/50">
                Mova o mouse ou deslize o dedo para explorar.
              </p>

              <button
                type="button"
                onClick={enableMotion}
                disabled={motionEnabled}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs text-white/70 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:opacity-50 [@media(hover:hover)_and_(pointer:fine)]:hidden"
              >
                <Smartphone className="size-4" aria-hidden="true" />
                {motionEnabled
                  ? "Movimento ativado"
                  : "Ativar movimento do celular"}
              </button>

              <p role="status" className="min-h-5 text-xs text-violet-300">
                {motionMessage}
              </p>
            </>
          )}
        </footer>
      </div>
    </dialog>
  );
}
