"use client";

import { motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export default function Reveal({
  children,
  progress,
  trigger = 0.05,
  delay = 0,
  className = "",
  direction = "left",
  color = "#A4B838",
  isTriggered,
  exitTriggered = false,
}) {
  const ref = useRef(null);
  const [played, setPlayed] = useState(false);

  const internalIsInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  useEffect(() => {
    if (isTriggered !== undefined) return;
    if (!progress) return;

    if (progress.get() >= trigger) {
      setPlayed(true);
      return;
    }

    const unsubscribe = progress.on("change", (latest) => {
      if (latest < trigger) return;

      setPlayed(true);
      unsubscribe();
    });

    return unsubscribe;
  }, [progress, trigger, isTriggered]);

  const shouldPlay =
    isTriggered !== undefined
      ? isTriggered
      : progress
        ? played
        : internalIsInView;

  const isRight = direction === "right";

  const duration = 1;

  const animation =
    direction === "right"
      ? {
          initial: {
            x: "100%",
            scaleX: 0,
            transformOrigin: "right",
          },

          animate: {
            x: ["100%", "0%", "-100%"],
            scaleX: [0, 1, 0],
            transformOrigin: ["right", "right", "left"],
          },
        }
      : {
          initial: {
            x: "-100%",
            scaleX: 0,
            transformOrigin: "left",
          },

          animate: {
            x: ["-100%", "0%", "100%"],
            scaleX: [0, 1, 0],
            transformOrigin: ["left", "left", "right"],
          },
        };

  const exitAnimation =
    direction === "right"
      ? {
          x: ["-100%", "0%"],
          scaleX: [0, 1],
          transformOrigin: ["left", "right"],
        }
      : {
          x: ["100%", "0%"],
          scaleX: [0, 1],
          transformOrigin: ["right", "left"],
        };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {/* TEXT */}
      <motion.div
        initial={{
          opacity: 0,
          x: isRight ? 10 : -10,
        }}
        animate={
          exitTriggered
            ? {
                opacity: 0,
                x: isRight ? 10 : -10,
              }
            : shouldPlay
              ? {
                  opacity: 1,
                  x: 0,
                }
              : {}
        }
        transition={{
          delay: exitTriggered
            ? 0
            : delay + duration * 0.5,

          duration: 0.3,

          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>

      {/* REVEAL BLOCK */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: color,
          pointerEvents: "none",
          willChange: "transform",
        }}
        initial={animation.initial}
        animate={
          exitTriggered
            ? exitAnimation
            : shouldPlay
              ? animation.animate
              : {}
        }
        transition={{
          delay: exitTriggered ? 0 : delay,

          duration,

          ease: "linear",

          times: [0, 0.5, 1],
        }}
      />
    </div>
  );
}