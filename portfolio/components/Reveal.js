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
    if (isTriggered !== undefined || !progress) return;

    if (progress.get() >= trigger) {
      setPlayed(true);
      return;
    }

    const unsubscribe = progress.on("change", (latest) => {
      if (latest >= trigger) {
        setPlayed(true);
        unsubscribe();
      }
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

  const initialX = isRight ? "100%" : "-100%";
  const middleX = "0%";
  const finalX = isRight ? "-100%" : "100%";

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
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
              : undefined
        }
        transition={{
          delay: exitTriggered ? 0 : delay + 0.5,
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </motion.div>

      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: color,
          pointerEvents: "none",
          willChange: "transform",
          transformOrigin: isRight ? "right" : "left",
        }}
        initial={{
          x: initialX,
          scaleX: 0,
        }}
        animate={
          exitTriggered
            ? {
                x: isRight ? "-100%" : "100%",
                scaleX: 0,
              }
            : shouldPlay
              ? {
                  x: [initialX, middleX, finalX],
                  scaleX: [0, 1, 0],
                }
              : undefined
        }
        transition={{
          delay: exitTriggered ? 0 : delay,
          duration: 1,
          ease: "linear",
          times: [0, 0.5, 1],
        }}
      />
    </div>
  );
}