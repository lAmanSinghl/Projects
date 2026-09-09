"use client";

import { motion, useScroll, useTransform } from "motion/react";
import HorizontalReveal from "@/components/HorizontalReveal";

export default function JourneySection({ horizontalRef }) {
  const { scrollYProgress } = useScroll({
    target: horizontalRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={horizontalRef} className="relative h-[280vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{
            x: useTransform(
              scrollYProgress,
              [0, 0.75],
              ["0%", "-170%"]
            ),
          }}
          className="flex"
        >
          <section className="w-screen h-screen shrink-0 relative top-2">

            <div className=" absolute top-18 left-330 w-70 h-78 overflow-hidden rounded-xl scale-90">
              <img
                src="IMG_20260101_111852.jpg.jpeg"
                alt=""
                className="absolute w-200 scale-200 -top-35 right-10"
              />
            </div>

            <div className="absolute text-[#B4B8A5] left-328 top-91 w-40 scale-70">
              <HorizontalReveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.15}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  NOIDA, 2024
                </div>
              </HorizontalReveal>
            </div>

            <div className=" absolute top-103 left-380 w-70 h-78 overflow-hidden rounded-xl scale-78">
              <img
                src="Screenshot_2026-06-11-12-08-43-003_com.instagram.android-edit.jpg.jpeg"
                style={{
                  filter:
                    "grayscale(150%) sepia(50%) brightness(0.6) contrast(0.95)",
                }}
                alt=""
                className="absolute w-200 scale-130 -top-25 right-10 opacity-80"
              />
            </div>

            <div className="absolute text-[#B4B8A5] left-412 top-171 w-35 scale-70">
              <HorizontalReveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.15}
              >
                <div className="relative left-5 text-2xl scale-y-55 scale-x-70">
                  JAIPUR, 2018
                </div>
              </HorizontalReveal>
            </div>

            <div className="relative top-70 left-430 w-fit scale-70 font-datatype text-[#B4B8A5]">
              <img
                src="952101786200610_School_Photo_2026.jpg"
                alt=""
                className="rounded-xl w-222 relative"
              />

              <div className="absolute bottom-123 -left-1 w-80">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.15}
                >
                  <div className="relative -left-10 text-2xl scale-y-55 scale-x-70">
                    MUGHALSARAI, 2008-2022
                  </div>
                </HorizontalReveal>
              </div>

              <div className="absolute -top-95">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.05}
                >
                  <div className="font-medula text-5xl">
                    SUNBEAM SCHOOL MUGHALSARAI
                  </div>
                </HorizontalReveal>
              </div>

              <div className="absolute -top-82 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.09}
                >
                  A chapter of growth, discovery, and the first steps toward
                  technology and innovation.It was during these years that I
                  developed a strong academic foundation, learned the value of
                  discipline, and discovered a curiosity for problem-solving.
                  Beyond the classroom, the experiences, friendships, and
                  challenges shaped the mindset that continues to guide me today.
                </HorizontalReveal>
              </div>

              <div className="w-full flex absolute justify-between -top-41 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.09}
                >
                  <div className="">CLASS 10 (2019-20)</div>
                </HorizontalReveal>

                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.09}
                >
                  <div>87%</div>
                </HorizontalReveal>
              </div>

              <div className="w-full flex absolute justify-between -top-31 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.09}
                >
                  <div className="">CLASS 12 (2021-22)</div>
                </HorizontalReveal>

                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.09}
                >
                  <div>80%</div>
                </HorizontalReveal>
              </div>
            </div>

            <div className=" absolute top-14 left-634 w-70 h-78 overflow-hidden rounded-xl scale-78">
              <img
                src="IMG_20250203_024609.jpg.jpeg"
                style={{
                  filter: "grayscale(100%) sepia(10%) brightness(1)",
                }}
                alt=""
                className="absolute w-200 scale-130 -top-25 right-10 opacity-90"
              />
            </div>

            <div className="absolute text-[#4a4b48] left-635 top-82 w-42 scale-70">
              <HorizontalReveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.45}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  PUSHKAR, 2024
                </div>
              </HorizontalReveal>
            </div>

            <div className=" absolute top-92 left-680 w-60 h-78 overflow-hidden rounded-xl">
              <img
                src="SAVE_20260908_154138.jpg.jpeg"
                alt=""
                className="absolute w-200 scale-160 -top-18"
              />
            </div>

            <div className="absolute text-[#4a4b48] left-717 top-169 w-42 scale-70">
              <HorizontalReveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.45}
              >
                <div className="relative -left-4 text-2xl scale-y-55 scale-x-70">
                  Delhi, 2025
                </div>
              </HorizontalReveal>
            </div>

            <div className="absolute top-73 left-735 w-210 scale-80 font-datatype text-[#565752]">
              <img
                src="a7.jpg.jpeg"
                alt=""
                className="rounded-xl w-220"
              />

              <div className="absolute bottom-110 -left-1 w-80 scale-y-70">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.51}
                >
                  <div className="relative -left-6 text-2xl scale-y-55 scale-x-70 text-[#4a4b48]">
                    NOIDA, 20023-2027
                  </div>
                </HorizontalReveal>
              </div>

              <div className="absolute -top-78">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.51}
                >
                  <div className="font-medula text-5xl">
                    JSS Academy of Technical Education
                  </div>
                </HorizontalReveal>
              </div>

              <div className="absolute -top-65 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.49}
                >
                  A period of exploration, innovation, and turning knowledge
                  into practice.Through academics, projects, and hands-on
                  development, I gained the skills to build meaningful software
                  and tackle complex challenges.
                </HorizontalReveal>
              </div>

              <div className="w-full flex absolute justify-between -top-35 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.51}
                >
                  <div className="">1rst year</div>
                </HorizontalReveal>

                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.59}
                >
                  <div>7.205</div>
                </HorizontalReveal>
              </div>

              <div className="w-full flex absolute justify-between -top-28 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.51}
                >
                  <div className="">2nd year</div>
                </HorizontalReveal>

                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.59}
                >
                  <div>7.770</div>
                </HorizontalReveal>
              </div>

              <div className="w-full flex absolute justify-between -top-21 font-medula text-4xl">
                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.51}
                >
                  <div className="">3nd year</div>
                </HorizontalReveal>

                <HorizontalReveal
                  progress={scrollYProgress}
                  color="#D5F831"
                  trigger={0.59}
                >
                  <div>7.940</div>
                </HorizontalReveal>
              </div>
            </div>

            <div className=" absolute top-54 left-930 w-67 h-48 overflow-hidden rounded-xl">
              <img
                src="IMG_20250202_231904.jpg.jpeg"
                alt=""
                className="absolute w-200 scale-160 -top-36"
                style={{
                  filter:
                    "grayscale(150%) sepia(10%) brightness(1)",
                }}
              />
            </div>

            <div className="absolute top-47 left-921 w-60 scale-70 text-[#4a4b48]">
              <HorizontalReveal
                progress={scrollYProgress}
                color="#D5F831"
                trigger={0.65}
              >
                <div className="relative -left-7 text-2xl scale-y-55 scale-x-70">
                  NOIDA, 20023-2027
                </div>
              </HorizontalReveal>
            </div>

          </section>
        </motion.div>
      </div>
    </section>
  );
}