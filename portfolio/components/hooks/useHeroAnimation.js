import {
  useTransform,
  useSpring,
  useMotionTemplate,
} from "motion/react";

export default function useHeroAnimation(scrollYProgress) {
  const p1 = useTransform(
    scrollYProgress,
    [0.15, 0.32],
    [0, 1]
  );

  const p2 = useTransform(
    scrollYProgress,
    [0.32, 0.54],
    [0, 1]
  );

  const bgColor2 = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["#fdfaf7", "#5A5D53"]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [1, 0.5, 0.43]
  );

  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    ["0px", "40px", "40px"]
  );

  const smoothScale = useSpring(scale, {
    stiffness: 120,
    damping: 22,
  });

  const saturation = useTransform(
    scrollYProgress,
    [0, 0.6],
    [1, 0.25]
  );

  const imageFilter = useMotionTemplate`saturate(${saturation})`;

  return {
    p1,
    p2,
    bgColor2,
    smoothScale,
    borderRadius,
    imageFilter,
  };
}