import {
  AnimatePresence,
  motion as Motion,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";

export function MotionSubtitle({
  text,
  className,
  direction = "top",
  speed = 1,
  stagger = 0.018,
}) {
  const reducedMotion = useReducedMotion();

  const chars = Array.from(text);
  const safeSpeed = Math.min(3, Math.max(0.3, speed));
  const speedFactor = 1 / safeSpeed;
  const safeStagger = Math.min(0.08, Math.max(0, stagger));

  const directionY = direction === "bottom" ? 10 : -10;
  const exitY = direction === "bottom" ? -3 : 3;

  if (reducedMotion) {
    return <span className={cn("block text-center", className)}>{text}</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex min-h-[1.3em] max-w-full items-center justify-center",
        className,
      )}
    >
      {/* Leitores de tela recebem a frase inteira. */}
      <span className="sr-only">{text}</span>

      <AnimatePresence mode="wait" initial={false}>
        <Motion.span
          key={text}
          aria-hidden="true"
          className="inline-block max-w-full"
          initial={{
            opacity: 0,
            y: directionY * 0.8,
            filter: "blur(5px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            y: exitY,
            filter: "blur(4px)",
          }}
          transition={{
            duration: 0.28 * speedFactor,
            ease: "easeOut",
          }}
        >
          {chars.map((char, index) =>
            char === " " ? (
              <span key={index}> </span>
            ) : (
              <Motion.span
                key={index}
                className="inline-block"
                initial={{
                  opacity: 0,
                  y: directionY,
                  filter: "blur(6px)",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={{
                  opacity: 0,
                  y: exitY,
                  filter: "blur(4px)",
                }}
                transition={{
                  duration: 0.24 * speedFactor,
                  ease: "easeOut",
                  delay: index * safeStagger * speedFactor,
                }}
              >
                {char}
              </Motion.span>
            ),
          )}
        </Motion.span>
      </AnimatePresence>
    </span>
  );
}

export default MotionSubtitle;
