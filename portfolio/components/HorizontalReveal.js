"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    // Already past the trigger when mounted
    if (progress.get() >= trigger) {
      setPlayed(true);
      return;
    }

    // Listen only until this reveal has played
    const unsubscribe = progress.on("change", (latest) => {
      if (latest < trigger) return;

      setPlayed(true);
      unsubscribe();
    });

    return unsubscribe;
  }, [progress, trigger]);

  const isRight = direction === "right";

  const initial = {
    x: isRight ? "100%" : "-100%",
    scaleX: 0,
    transformOrigin: isRight ? "right" : "left",
  };

  const animate = isRight
    ? {
        x: ["100%", "0%", "-100%"],
        scaleX: [0, 1, 0],
        transformOrigin: ["right", "right", "left"],
      }
    : {
        x: ["-100%", "0%", "100%"],
        scaleX: [0, 1, 0],
        transformOrigin: ["left", "left", "right"],
      };

  return (
    <div
      className={`relative inline-block overflow-hidden ${className}`}
    >
      {/* Text / Content */}
      <motion.div
        initial={{
          opacity: 0,
          x: isRight ? 10 : -10,
        }}
        animate={
          played
            ? {
                opacity: 1,
                x: 0,
              }
            : {}
        }
        transition={{
          delay: delay + 0.42,
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>

      {/* Animated reveal block */}
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: color,
          pointerEvents: "none",
          willChange: "transform",
        }}
        initial={initial}
        animate={played ? animate : {}}
        transition={{
          delay,
          duration: 1.15,
          ease: [0.76, 0, 0.24, 1],
          times: [0, 0.55, 1],
        }}
      />
    </div>
  );
}