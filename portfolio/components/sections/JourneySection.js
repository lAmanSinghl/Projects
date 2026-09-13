"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Reveal from "@/components/Reveal";

export default function JourneySection({ horizontalRef }) {
  const { scrollYProgress } = useScroll({
    target: horizontalRef,
    offset: ["start end", "end start"],
  });

  const horizontalX = useTransform(
    scrollYProgress,
    [0, 0.75],
    ["0%", "-170%"]
  );

  return (
    <section
      ref={horizontalRef}
      className="relative h-[280vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{
            x: horizontalX,
            willChange: "transform",
          }}
          className="flex"
        >
          <section className="relative top-2 h-screen w-screen shrink-0">

            {/* ==================== NOIDA ==================== */}

            <div className="absolute top-18 left-330 h-78 w-70 overflow-hidden rounded-xl scale-90">
              <img
                src="IMG_20260101_111852.jpg.jpeg"
                alt=""
                loading="eager"
                decoding="async"
                className="absolute w-200 scale-200 -top-35 right-10"
              />
            </div>

            <div className="absolute left-328 top-91 w-40 scale-70 text-[#B4B8A5]">
              <Reveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.14}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  NOIDA, 2024
                </div>
              </Reveal>
            </div>


            {/* ==================== JAIPUR ==================== */}

            <div className="absolute top-103 left-380 h-78 w-70 overflow-hidden rounded-xl scale-78">
              <img
                src="Screenshot_2026-06-11-12-08-43-003_com.instagram.android-edit.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute w-200 scale-130 -top-25 right-10 opacity-80"
                style={{
                  filter:
                    "grayscale(150%) sepia(50%) brightness(0.6) contrast(0.95)",
                }}
              />
            </div>

            <div className="absolute left-412 top-171 w-35 scale-70 text-[#B4B8A5]">
              <Reveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.17}
              >
                <div className="relative left-5 text-2xl scale-y-55 scale-x-70">
                  JAIPUR, 2018
                </div>
              </Reveal>
            </div>


            {/* ==================== SCHOOL ==================== */}

            <div className="relative top-70 left-430 w-fit scale-70 font-datatype text-[#B4B8A5]">
              <img
                src="952101786200610_School_Photo_2026.jpg"
                alt=""
                loading="lazy"
                decoding="async"
                className="rounded-xl w-222"
              />

              {/* School title */}

              <div className="absolute -top-95">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.10}
                  delay={0}
                >
                  <div className="font-medula text-5xl">
                    SUNBEAM SCHOOL MUGHALSARAI
                  </div>
                </Reveal>
              </div>

              {/* School description */}

              <div className="absolute -top-82 font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.105}
                  delay={0.08}
                >
                  A chapter of growth, discovery, and the first steps toward
                  technology and innovation.It was during these years that I
                  developed a strong academic foundation, learned the value of
                  discipline, and discovered a curiosity for problem-solving.
                  Beyond the classroom, the experiences, friendships, and
                  challenges shaped the mindset that continues to guide me today.
                </Reveal>
              </div>

              {/* Class 10 */}

              <div className="absolute -top-41 flex w-full justify-between font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.11}
                  delay={0.16}
                >
                  <div>CLASS 10 (2019-20)</div>
                </Reveal>

                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.112}
                  delay={0.24}
                >
                  <div>87%</div>
                </Reveal>
              </div>

              {/* Class 12 */}

              <div className="absolute -top-31 flex w-full justify-between font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.115}
                  delay={0.32}
                >
                  <div>CLASS 12 (2021-22)</div>
                </Reveal>

                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.117}
                  delay={0.40}
                >
                  <div>80%</div>
                </Reveal>
              </div>

              {/* Mughalsarai */}

              <div className="absolute bottom-123 -left-1 w-80">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.12}
                  delay={0.48}
                >
                  <div className="relative -left-10 text-2xl scale-y-55 scale-x-70">
                    MUGHALSARAI, 2008-2022
                  </div>
                </Reveal>
              </div>
            </div>


            {/* ==================== PUSHKAR ==================== */}

            <div className="absolute top-14 left-634 h-78 w-70 overflow-hidden rounded-xl scale-78">
              <img
                src="IMG_20250203_024609.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute w-200 scale-130 -top-25 right-10 opacity-90"
                style={{
                  filter: "grayscale(100%) sepia(10%) brightness(1)",
                }}
              />
            </div>

            <div className="absolute left-635 top-82 w-42 scale-70 text-[#4a4b48]">
              <Reveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.44}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  PUSHKAR, 2024
                </div>
              </Reveal>
            </div>


            {/* ==================== DELHI ==================== */}

            <div className="absolute top-92 left-680 h-78 w-60 overflow-hidden rounded-xl">
              <img
                src="SAVE_20260908_154138.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute w-200 scale-160 -top-18"
              />
            </div>

            <div className="absolute left-717 top-169 w-42 scale-70 text-[#4a4b48]">
              <Reveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.47}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  Delhi, 2025
                </div>
              </Reveal>
            </div>


            {/* ==================== COLLEGE ==================== */}

            <div className="absolute top-73 left-735 w-210 scale-80 font-datatype text-[#565752]">
              <img
                src="a7.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                className="rounded-xl w-220"
              />

              {/* College title */}

              <div className="absolute -top-78">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.47}
                  delay={0}
                >
                  <div className="font-medula text-5xl">
                    JSS Academy of Technical Education
                  </div>
                </Reveal>
              </div>

              {/* College description */}

              <div className="absolute -top-65 font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.475}
                  delay={0.08}
                >
                  A period of exploration, innovation, and turning knowledge
                  into practice.Through academics, projects, and hands-on
                  development, I gained the skills to build meaningful software
                  and tackle complex challenges.
                </Reveal>
              </div>

              {/* 1st year */}

              <div className="absolute -top-35 flex w-full justify-between font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.48}
                  delay={0.16}
                >
                  <div>1rst year</div>
                </Reveal>

                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.482}
                  delay={0.24}
                >
                  <div>7.205</div>
                </Reveal>
              </div>

              {/* 2nd year */}

              <div className="absolute -top-28 flex w-full justify-between font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.485}
                  delay={0.32}
                >
                  <div>2nd year</div>
                </Reveal>

                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.487}
                  delay={0.40}
                >
                  <div>7.770</div>
                </Reveal>
              </div>

              {/* 3rd year */}

              <div className="absolute -top-21 flex w-full justify-between font-medula text-4xl">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.49}
                  delay={0.48}
                >
                  <div>3nd year</div>
                </Reveal>

                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.492}
                  delay={0.56}
                >
                  <div>7.940</div>
                </Reveal>
              </div>

              {/* Noida */}

              <div className="absolute bottom-110 -left-1 w-80 scale-y-70">
                <Reveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.495}
                  delay={0.64}
                >
                  <div className="relative -left-10 text-2xl scale-y-55 scale-x-70 text-[#4a4b48]">
                    NOIDA, 20023-2027
                  </div>
                </Reveal>
              </div>
            </div>


            {/* ==================== FINAL IMAGE ==================== */}

            <div className="absolute top-54 left-930 h-48 w-67 overflow-hidden rounded-xl">
              <img
                src="IMG_20250202_231904.jpg.jpeg"
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute w-200 scale-160 -top-36"
                style={{
                  filter: "grayscale(150%) sepia(10%) brightness(1)",
                }}
              />
            </div>

            <div className="absolute left-921 top-47 w-60 scale-70 text-[#4a4b48]">
              <Reveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.65}
              >
                <div className="relative -left-7 text-2xl scale-y-55 scale-x-70">
                  NOIDA, 20023-2027
                </div>
              </Reveal>
            </div>

          </section>
        </motion.div>
      </div>
    </section>
  );
}