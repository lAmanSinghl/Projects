"use client";

import { motion } from "motion/react";

import Topography from "@/components/Topography";
import Signature from "@/components/Signature";
import useHeroAnimation from "@/components/hooks/useHeroAnimation";
export default function HeroSection({
  heroRef,
  scrollYProgress,
}) {

  const {
    p1,
    p2,
    bgColor2,
    smoothScale,
    borderRadius,
    imageFilter,
  } = useHeroAnimation(scrollYProgress);


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
          className="h-screen overflow-hidden bg-[] flex justify-center"
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
              className="relative -top-[488.8px] right-6 w-330 pointer-events-none"
              src="PhotoshopPreview_Image.png"
              alt=""
            />
          </div>

        </motion.div>

      </div>
    </section>
  );
}