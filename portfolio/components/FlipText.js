"use client"
"use client";

import { motion } from "motion/react";

const DURATION = 0.25;
const STAGGER = 0.025;

export default function FlipText({
  text,
  className = "",
  as: Component = "div",
}) {
  return (
    <Component className={className}>
      <motion.div
        initial="initial"
        whileHover="hovered"
        className="relative block overflow-hidden whitespace-nowrap"
        style={{ lineHeight: 0.85}}
      >
        <div>
          {text.split("").map((char, i) => (
            <motion.span
              key={`top-${i}`}
              className="inline-block"
              variants={{
                initial: { y: 0 },
                hovered: { y: "-100%" },
              }}
              transition={{
                duration: DURATION,
                ease: "easeInOut",
                delay: STAGGER * i,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        <div className="absolute inset-0">
          {text.split("").map((char, i) => (
            <motion.span
              key={`bottom-${i}`}
              className="inline-block"
              variants={{
                initial: { y: "100%" },
                hovered: { y: 0 },
              }}
              transition={{
                duration: DURATION,
                ease: "easeInOut",
                delay: STAGGER * i,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </Component>
  );
}