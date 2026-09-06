"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export default function RevealText({
  children,
  delay = 0,
  className = "",
  direction = "left",
  color = "#A4B838",
}) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
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
    <div
      ref={ref}
      className={`relative  overflow-hidden ${className}`}
    >
      {/* Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
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
        style={{ backgroundColor: color }}
        initial={animation.initial}
        animate={isInView ? animation.animate : {}}
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