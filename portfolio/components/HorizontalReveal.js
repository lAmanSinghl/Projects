"use client";

import { motion, useMotionValueEvent } from "motion/react";
import { useState } from "react";

export default function HorizontalReveal({
  children,
  progress,
  trigger = 0.05,
  delay = 0,
  className = "",
  direction = "left",
  color = "#A4B838",
}) {
  const [played, setPlayed] = useState(false);

  useMotionValueEvent(progress, "change", (latest) => {
    if (latest >= trigger) {
      setPlayed(true);
    }
  });

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

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      {/* Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: played ? 1 : 0 }}
        transition={{
          delay: delay + duration * 0.5,
          duration: 0,
        }}
      >
        {children}
      </motion.div>

      {/* Reveal Bar */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: color,
          pointerEvents: "none",
        }}
        initial={animation.initial}
        animate={played ? animation.animate : {}}
        transition={{
          delay,
          duration,
          ease: "linear",
          times: [0, 0.5, 1],
        }}
      />
    </div>
  );
}