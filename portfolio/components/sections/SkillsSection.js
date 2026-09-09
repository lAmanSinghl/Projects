"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import Skill from "@/components/Skill.js";
import Project from "@/components/Project.js";
import RevealText from "@/components/Reveal";
import CardSwap, { Card } from "@/components/Cardswap";

export default function SkillsSection({ skillsRef }) {
    const { scrollYProgress: skillsProgress } = useScroll({
    target: skillsRef,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: skillsStickyProgress } = useScroll({
    target: skillsRef,
    offset: ["start start", "end end"],
  });

  const leftX = useTransform(
    skillsProgress,
    [0, 0.55],
    ["0%", "20%"]
  );

  const leftTX = useTransform(
    skillsProgress,
    [0, 0.35],
    ["0%", "12%"]
  );

  const rightX = useTransform(
    skillsProgress,
    [0, 0.55],
    ["0%", "-19%"]
  );

  const rightTX = useTransform(
    skillsProgress,
    [0, 0.35],
    ["0%", "-12%"]
  );

  const isInView = useInView(skillsRef, {
    once: true,
    amount: 0.2,
  });

  const coverY = useTransform(
    skillsStickyProgress,
    [0.07, 0.99],
    ["100%", "0%"]
  );
  
  return (
    <section ref={skillsRef} className="relative h-[160vh]">
      <div className="sticky top-0 h-screen overflow-hidden ">
        <div className="h-screen w-screen flex justify-center items-center text-[#282C20] ">
          <motion.div className="font-medula text-6xl scale-260 font-bold relative -top-45">
            SKILLS
            <div className="w-200 absolute -left-44 -top-32 ">
              <Skill isInView={isInView} />
            </div>
          </motion.div>

          <div className="absolute top-95 text-[#282C20] flex gap-60 ">
            <motion.div
              style={{ x: leftTX }}
              className="font-medula text-[110px] relative font-bold w-200 flex flex-col justify-end "
            >
              <div className="w-full flex justify-end mb-9">
                <RevealText color="#282C20" className="leading-none">
                  <span className="">Design</span>
                </RevealText>
              </div>

              <div className="text-lg font-datatype w-80 font-bold text-right relative left-120 leading-5 ">
                <RevealText color="#282C20" className="leading-none mb-1">
                  <span className="">
                    Creating engaging, responsive, and{" "}
                  </span>
                </RevealText>
                <RevealText color="#282C20" className="leading-none">
                  <span>interactive user experiences</span>
                </RevealText>
              </div>

              <div className="left-189 relative rounded-md h-11 w-11 flex items-center justify-center bg-[#D2FF00] mt-1">
                <lord-icon
                  src="https://cdn.lordicon.com/dcyiaoek.json"
                  trigger="hover"
                  colors="primary:#292d20"
                  style={{ width: 15 }}
                ></lord-icon>
              </div>
            </motion.div>

            <motion.div
              style={{ x: rightTX }}
              className="font-medula text-[110px] font-bold w-200 "
            >
              <div className="w-fit mb-9">
                <RevealText
                  color="#282C20"
                  className="leading-none"
                  direction="right"
                >
                  <span className="">Develop</span>
                </RevealText>
              </div>

              <div className="text-lg font-datatype w-80 font-bold relative leading-5 ">
                <RevealText
                  color="#282C20"
                  className="leading-none mb-1"
                  direction="right"
                >
                  <span className="">
                    Building scalable, reliable, and
                  </span>
                </RevealText>
                <RevealText
                  color="#282C20"
                  className="leading-none"
                  direction="right"
                >
                  <span>performant applications.</span>
                </RevealText>
              </div>

              <div className="text-lg font-datatype w-80 font-bold leading-5  ">
              </div>

              <div className="relative rounded-md h-11 w-11 flex items-center justify-center bg-[#D2FF00] mt-1">
                <lord-icon
                  src="https://cdn.lordicon.com/dcyiaoek.json"
                  trigger="hover"
                  colors="primary:#292d20"
                  style={{ width: 15, transform: "rotate(180deg)" }}
                ></lord-icon>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Robot */}
        <motion.div
          style={{ x: leftX }}
          className="w-[50vw] absolute -left-82.5 -top-20"
        >
          <img src="Adobe Express - file.png" alt="" />
        </motion.div>

        {/* Human */}
        <motion.div
          style={{ x: rightX }}
          className="w-[50vw] absolute left-279.5 overflow-hidden -top-20"
        >
          <img src="Untitled - June 13, 2026 at 15.14.19.png" alt="" />
        </motion.div>

        <motion.div
          style={{ y: coverY }}
          className="absolute inset-0 bg-[#111112] z-9 overflow-hidden flex h-screen"
        >
          <div className="font-medula text-6xl font-bold text-white flex justify-center items-center h-70 relative top-19 ">
            <div className="scale-250 absolute left-170 top-25">
              Project
            </div>

            <div className="w-100 absolute left-230 top-20 rotate-3 scale-370 pointer-events-none">
              <Project />
            </div>
          </div>

          <section className="absolute h-screen">
            <div
              style={{ height: "600px", position: "relative" }}
              className="left-380 top-20"
            >
              <CardSwap
                cardDistance={60}
                verticalDistance={70}
                delay={5000}
                pauseOnHover={false}
              >
                <Card>
                  <h3>Card 1</h3>
                  <p>Your content here</p>
                </Card>

                <Card>
                  <h3>Card 2</h3>
                  <p>Your content here</p>
                </Card>

                <Card>
                  <h3>Card 3</h3>
                  <p>Your content here</p>
                </Card>
              </CardSwap>
            </div>
          </section>
        </motion.div>
      </div>
    </section>
  );
}