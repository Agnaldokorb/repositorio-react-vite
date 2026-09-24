"use client";

import { useEffect, useRef, useState } from "react";

const lines = [
  "// Transformando ideias em código",
  "import { createApp } from './core'",
  "",
  "const theme = {",
  "  primary: '#023e8a',",
  "  accent: '#90e0ef',",
  "  background: '#f4fcfe',",
  "}",
  "",
  "async function buildExperience() {",
  "  const app = createApp({ theme })",
  "",
  "  await app.connect()",
  "",
  "  app.render({",
  "    title: 'Sua próxima ideia',",
  "    responsive: true,",
  "    animations: true,",
  "  })",
  "",
  "  return app.start()",
  "}",
  "",
  "buildExperience()",
  "// Pronto para criar algo novo.",
];

const code = lines.join("\n");

const tokenPattern =
  /(\/\/.*|'[^']*'|\b(?:import|from|const|async|function|await|return|true|false)\b)/g;

function colorFor(token) {
  if (token.startsWith("//")) {
    return "var(--muted-foreground, #005a77)";
  }

  if (token.startsWith("'")) {
    return "var(--ring, #0077b6)";
  }

  if (
    /^(import|from|const|async|function|await|return|true|false)$/.test(token)
  ) {
    return "var(--primary, #023e8a)";
  }

  return "var(--foreground, #03045e)";
}

const tokenizedLines = lines.map((line) =>
  line.split(tokenPattern).map((text) => ({
    text,
    color: colorFor(text),
  })),
);

export default function SiteBackground({ speed = 32, opacity = 0.15 }) {
  const [count, setCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const delay = Number.isFinite(speed) ? Math.max(10, speed) : 32;

    let timer;
    let position = 0;

    function tick() {
      position = position >= code.length ? 0 : position + 1;
      setCount(position);

      timer = window.setTimeout(tick, position === code.length ? 3000 : delay);
    }

    function syncAnimation() {
      window.clearTimeout(timer);
      setReducedMotion(media.matches);

      if (media.matches) {
        position = code.length;
        setCount(position);
        return;
      }

      if (!document.hidden) {
        timer = window.setTimeout(tick, delay);
      }
    }

    media.addEventListener("change", syncAnimation);
    document.addEventListener("visibilitychange", syncAnimation);

    syncAnimation();

    return () => {
      window.clearTimeout(timer);
      media.removeEventListener("change", syncAnimation);
      document.removeEventListener("visibilitychange", syncAnimation);
    };
  }, [speed]);

  useEffect(() => {
    const element = scrollRef.current;

    if (element) {
      element.scrollTop = count === 0 ? 0 : element.scrollHeight;
    }
  }, [count]);

  const visibleLines = code.slice(0, count).split("\n");

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 select-none overflow-hidden bg-background"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top right, var(--secondary, #ade8f4), var(--background, #f4fcfe) 75%)",
        }}
      />

      <div
        ref={scrollRef}
        className="absolute inset-x-0 bottom-0 top-[calc(78px+20px)] overflow-hidden px-6 pb-6 font-mono text-xs leading-[1.9] sm:px-8 sm:text-sm"
        style={{ opacity }}
      >
        {visibleLines.map((line, lineIndex) => {
          let remaining = line.length;

          return (
            <div key={lineIndex} className="flex min-h-[1.9em]">
              <span className="w-[4ch] shrink-0 text-muted-foreground">
                {String(lineIndex + 1).padStart(2, "0")}
              </span>

              <span className="whitespace-pre">
                {tokenizedLines[lineIndex].map((token, tokenIndex) => {
                  const text = token.text.slice(0, Math.max(0, remaining));

                  remaining -= text.length;

                  return (
                    <span key={tokenIndex} style={{ color: token.color }}>
                      {text}
                    </span>
                  );
                })}

                {lineIndex === visibleLines.length - 1 && !reducedMotion && (
                  <span className="ml-[3px] inline-block h-[1em] w-[2px] animate-pulse bg-primary align-text-bottom motion-reduce:animate-none" />
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--background, #f4fcfe))",
        }}
      />
    </div>
  );
}
