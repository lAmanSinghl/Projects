"use client";

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "motion/react";

import Topography from "@/components/Topography";
import Signature from "@/components/Signature";

export default function HeroSection({ heroRef }) {
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

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

  return (
    <section ref={heroRef} className="relative h-[250vh] ">

      <div className="sticky top-0 h-screen overflow-hidden ">

        <div className="absolute z-10 flex justify-center items-center left-60 overflow-hidden w-300 top-46">
          <Signature
            p1={p1}
            p2={p2}
            className=" w-150  scale-170  "
          />
        </div>

        <div className="absolute inset-0 -z-10 pointer-events-none text-8xl flex flex-col justify-center items-center ">
          <div className="overflow-hidden w-full flex flex-col">

            <div className="ticker-track text-[#B2C73A] font-medula scale-x-250">
              <div className="ticker-group">
                {Array(10)
                  .fill("BUILDING INTERACTIVE EXPERIENCES • ")
                  .join("")}
              </div>

              <div className="ticker-group">
                {Array(10)
                  .fill("BUILDING INTERACTIVE EXPERIENCES • ")
                  .join("")}
              </div>
            </div>

            <div className="ticker-track2 text-[#fdfaf7ef] font-datatype scale-x-110 scale-y-85 font-semibold">
              <div className="ticker-group">
                {Array(10)
                  .fill("BUILDING INTERACTIVE EXPERIENCES • ")
                  .join("")}
              </div>

              <div className="ticker-group">
                {Array(10)
                  .fill("BUILDING INTERACTIVE EXPERIENCES • ")
                  .join("")}
              </div>
            </div>

          </div>
        </div>

        <motion.div
          style={{
            scale: smoothScale,
            borderRadius,
            transformOrigin: "center center",
            backgroundColor: bgColor2,
          }}
          className="h-screen overflow-hidden flex justify-center"
        >

          <div className="absolute inset-0 pointer-events-none">
            <Topography
              lowColor="#000000"
              midColor="#000000"
              highColor="#000000"
              speed={0.25}
              morphAmount={3}
              morphSpeed={0.05}
              bands={3}
              thickness={0.04}
              scale={2}
              pixelSize={1}
              glow={0}
              colorMode="uniform"
              contrast={3}
              brightness={1}
              fillBands={false}
              opacity={0.15}
              grain={false}
              mouseInteraction={false}
            />
          </div>

          <div className="flex items-center mt-31 w-[80%] justify-center font-datatype ">
            <motion.img
              style={{ filter: imageFilter }}
              className="absolute left-121 top-14 right-6 w-130 pointer-events-none"
              src="Firefly4.png"
              alt=""
            />
            <motion.img
              style={{ filter: imageFilter }}
              className="relative -top-[35.8px] right-6 w-130 pointer-events-none"
              src="Firefly.png"
              alt=""
            />
          </div>

        </motion.div>

      </div>
    </section>
  );
}