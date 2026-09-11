"use client";

import { motion, useScroll, useTransform, useInView } from "motion/react";
import Skill from "@/components/Skill.js";
import RevealText from "@/components/Reveal";


/* =========================================================
   TOOLS
   ========================================================= */

const designTools = [
  [
    "HTML",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg",
  ],
  [
    "CSS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg",
  ],
  [
    "JAVASCRIPT",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
  ],
  [
    "REACT.JS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg",
  ],
  [
    "NEXT.JS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg",
  ],
  [
    "TYPESCRIPT",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg",
  ],
  [
    "TAILWIND CSS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg",
  ],
  [
    "FRAMER MOTION",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/framermotion/framermotion-original.svg",
  ],
  [
    "THREE.JS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg",
  ],
  [
    "FIGMA",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg",
  ],
];

const developTools = [
  [
    "NODE.JS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg",
  ],
  [
    "EXPRESS.JS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg",
  ],
  [
    "MONGODB",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
  ],
  [
    "POSTGRESQL",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  ],
  [
    "AWS",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  ],
  [
    "AZURE",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  ],
  [
    "DOCKER",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  ],
  [
    "GIT",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg",
  ],
  [
    "GITHUB",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
  ],
  [
    "POSTMAN",
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg",
  ],
];


/* =========================================================
   TOOL ITEM
   ========================================================= */

function ToolItem({
  name,
  index,
  progress,
  total,
  start,
  end,
}) {
  const range = (end - start) / total;

  const itemStart = start + range * index;
  const itemEnd = start + range * (index + 1);

  const color = useTransform(
    progress,
    [
      itemStart - 0.015,
      itemStart,
      itemEnd,
      itemEnd + 0.015,
    ],
    [
      "#282C20",
      "#282C20",
      "#282C20",
      "#282C20",
    ]
  );

  /*
   * Subtle emphasis.
   * The active item becomes darker/sharper,
   * rather than making a huge visual jump.
   */
  const opacity = useTransform(
    progress,
    [
      itemStart - 0.02,
      itemStart,
      itemEnd,
      itemEnd + 0.02,
    ],
    [0.55, 1, 1, 0.55]
  );

  const markerWidth = useTransform(
    progress,
    [
      itemStart - 0.01,
      itemStart,
      itemEnd,
      itemEnd + 0.01,
    ],
    ["16px", "20px", "20px", "16px"]
  );

  return (
    <motion.div
      style={{
        color,
        opacity,
      }}
      className="flex items-center gap-3 h-[27px]"
    >
      <motion.div
        style={{
          width: markerWidth,
          backgroundColor: color,
        }}
        className="h-0.5 shrink-0"
      />

      <div>{name}</div>
    </motion.div>
  );
}


/* =========================================================
   TOOL LIST
   ========================================================= */

function ToolList({
  tools,
  progress,
  start,
  end,
}) {
  return (
    <div className="font-jetbrains text-[15px] tracking-[0.15em] leading-loose justify-center flex flex-col h-68 font-bold">

      {tools.map(([name], index) => (
        <ToolItem
          key={name}
          name={name}
          index={index}
          progress={progress}
          total={tools.length}
          start={start}
          end={end}
        />
      ))}

    </div>
  );
}


/* =========================================================
   LOGO ITEM
   ========================================================= */

function LogoItem({
  name,
  src,
  index,
  progress,
  total,
  start,
  end,
  isInView,
  entranceDelay,
}) {
  const range = (end - start) / total;

  const itemStart = start + range * index;
  const itemEnd = start + range * (index + 1);


  /* subtle active opacity */

  const opacity = useTransform(
    progress,
    [
      itemStart - 0.02,
      itemStart,
      itemEnd,
      itemEnd + 0.02,
    ],
    [0.45, 1, 1, 0.45]
  );


  /* subtle 6% scale */

  const scale = useTransform(
    progress,
    [
      itemStart - 0.01,
      itemStart,
      itemEnd,
      itemEnd + 0.01,
    ],
    [1, 1.06, 1.06, 1]
  );


  /*
   * Grayscale while inactive.
   * Active logo becomes its natural color.
   */

  const grayscale = useTransform(
    progress,
    [
      itemStart - 0.02,
      itemStart,
      itemEnd,
      itemEnd + 0.02,
    ],
    [1, 0, 0, 1]
  );

  const filter = useTransform(
    grayscale,
    (value) => `grayscale(${value})`
  );


  const markerOpacity = useTransform(
    progress,
    [
      itemStart - 0.01,
      itemStart,
      itemEnd,
      itemEnd + 0.01,
    ],
    [0, 1, 1, 0]
  );


  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              scale: 1,
            }
          : {}
      }
      transition={{
        duration: 0.35,
        delay: entranceDelay + index * 0.035,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex items-center justify-center shrink-0"
    >

      <motion.div
        style={{
          opacity,
          scale,
        }}
        className="relative w-8 h-8 flex items-center justify-center"
      >

        <motion.img
          src={src}
          alt={name}
          style={{
            filter,
          }}
          className="w-6 h-6 object-contain"
        />

      </motion.div>


      <motion.div
        style={{
          opacity: markerOpacity,
        }}
        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#282C20]"
      />

    </motion.div>
  );
}


/* =========================================================
   LOGO ROW
   ========================================================= */

function LogoRow({
  title,
  tools,
  progress,
  start,
  end,
  isInView,
  reverse = false,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
            }
          : {}
      }
      transition={{
        duration: 0.6,
        delay: reverse ? 0.5 : 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full"
    >

      {/* ROW LABEL */}

      <div className="flex items-center gap-3 mb-3">

        <span className="font-jetbrains text-[10px] tracking-[0.18em] font-bold">
          [{title}]
        </span>

        <motion.div
          initial={{
            scaleX: 0,
          }}
          animate={
            isInView
              ? {
                  scaleX: 1,
                }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: reverse ? 0.55 : 0.35,
            ease: "easeOut",
          }}
          className="h-[1px] flex-1 bg-[#282C20] origin-left"
        />

      </div>


      {/* LOGOS */}

      <div className="relative overflow-hidden">

        {/* Initial reveal */}

        <motion.div
          initial={{
            x: "0%",
          }}
          animate={
            isInView
              ? {
                  x: "105%",
                }
              : {}
          }
          transition={{
            duration: 1.1,
            delay: reverse ? 0.55 : 0.35,
            ease: [0.76, 0, 0.24, 1],
          }}
          className="absolute inset-0 bg-[#A4B838] z-10 pointer-events-none"
        />


        <div className="flex items-center justify-between gap-3 py-2">

          {tools.map(([name, src], index) => (
            <LogoItem
              key={name}
              name={name}
              src={src}
              index={index}
              total={tools.length}
              progress={progress}
              start={start}
              end={end}
              isInView={isInView}
              entranceDelay={
                (reverse ? 0.55 : 0.35) + 0.45
              }
            />
          ))}

        </div>

      </div>

    </motion.div>
  );
}


/* =========================================================
   MAIN SKILLS SECTION
   ========================================================= */

export default function SkillsSection({ skillsRef }) {

  const {
    scrollYProgress: skillsProgress,
  } = useScroll({
    target: skillsRef,
    offset: ["start end", "end start"],
  });


  const {
    scrollYProgress: skillsStickyProgress,
  } = useScroll({
    target: skillsRef,
    offset: ["start start", "end end"],
  });


  /* Existing side movement */

  const leftTX = useTransform(
    skillsProgress,
    [0, 0.35],
    ["0%", "12%"]
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


  /*
   * Longer section means this animation gets
   * much more physical scrolling distance.
   */


  /*
   * BOTH SIDES SHARE THIS RANGE.
   *
   * This is important:
   *
   * Design #1  = Develop #1
   * Design #2  = Develop #2
   * ...
   * Design #10 = Develop #10
   *
   * And their logos use the exact same range.
   */

  const toolStart = 0.08;
  const toolEnd = 0.65;


  return (
    <section
      ref={skillsRef}
      className="relative h-[400vh]"
    >

      <div className="sticky top-0 h-screen overflow-hidden">


        {/* =================================================
            MAIN SCREEN
        ================================================= */}

        <div className="h-screen w-screen flex justify-center items-center text-[#282C20]">


          {/* =================================================
              LEFT — DESIGN
          ================================================= */}

          <div className="h-full w-[33vw] shrink-0 flex justify-center relative top-36">

            <motion.div
              style={{
                x: leftTX,
              }}
              className="font-medula text-[110px] relative font-bold"
            >

              <div className="font-jetbrains text-[12px] tracking-[0.15em] leading-loose w-60 text-right relative ">

                <div className="w-full bg-black h-0.5 mb-0.5" />

                [ FRONTEND/VISUAL ]

              </div>


              <div className="w-full flex mb-2">

                <RevealText color="#282C20">
                  <span>Design</span>
                </RevealText>

              </div>


              <ToolList
                tools={designTools}
                progress={skillsStickyProgress}
                start={toolStart}
                end={toolEnd}
              />


              <div className="mt-8   flex felx-col items-center">
                <div className="w-18.5 font-jetbrains text-[12px]  leading-3.5 mr-3">
                  INTERFACES THAT FEEL RIGHT
                </div>

                <div className="w-12 h-0.5 bg-[#282C20] relative bottom-3.5 " />
              </div>

            </motion.div>

          </div>


          {/* =================================================
              CENTER
          ================================================= */}

          <div className="h-full w-[33vw] shrink-0 flex justify-center items-center flex-col ">


            <motion.div
              initial={{
                opacity: 0,
                scale: 2.4,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      scale: 2.6,
                    }
                  : {}
              }
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-medula text-7xl font-bold relative"
            >

              SKILLS

              <div className="w-200 absolute -left-44 -top-29">

                <Skill
                  isInView={isInView}
                />

              </div>

            </motion.div>


            {/* =================================================
                LOGOS
            ================================================= */}

            <div className="w-[31vw] mt-28 flex flex-col gap-7">

              <LogoRow
                title="DESIGN"
                tools={designTools}
                progress={skillsStickyProgress}
                start={toolStart}
                end={toolEnd}
                isInView={isInView}
              />

              <LogoRow
                title="DEVELOP"
                tools={developTools}
                progress={skillsStickyProgress}
                start={toolStart}
                end={toolEnd}
                isInView={isInView}
                reverse
              />

            </div>


            {/* =================================================
                CENTER COPY
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                delay: 1.5,
              }}
              className="mt-10 text-center font-jetbrains scale-y-90 font-semibold leading-4 text-[18px]"
            >

              <p>
                I LIKE BUILDING THINGS THAT
              </p>

              <p>
                LOOK GOOD, FEEL GOOD, AND
              </p>

              <p>
                ACTUALLY WORK.
              </p>

            </motion.div>


            <div className="w-full flex flex-col items-center">

              <div className="w-0.5 h-7 bg-gray-500 my-5" />

              <div className="font-jetbrains scale-y-90 font-semibold leading-4">
                ALWAYS LEARNING,ALWAYS BUILDING
              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT — DEVELOP
          ================================================= */}

          <div className="h-full w-[33vw] shrink-0 flex justify-center relative top-36">

            <motion.div
              style={{
                x: rightTX,
              }}
              className="font-medula text-[110px] font-bold"
            >

              <div className="font-jetbrains text-[12px] tracking-[0.15em] leading-loose w-60 relative ">

                <div className="w-full bg-black h-0.5 mb-0.5" />

                [ BACKEND/SYSTEMS ]

              </div>


              <div className="w-full flex mb-2">

                <RevealText
                  color="#282C20"
                  direction="right"
                >
                  <span>Develop</span>
                </RevealText>

              </div>


              <ToolList
                tools={developTools}
                progress={skillsStickyProgress}
                start={toolStart}
                end={toolEnd}
              />


              <div className="mt-8 text-[12px] font-bold flex felx-col items-center w-full justify-end">

                <div className="w-12 h-0.5 bg-[#282C20] relative bottom-3.5" />

                <div className="w-21.5  font-jetbrains text-[12px] leading-3.5 ml-3">
                  SCALABLE IDEAS
                  <p>REAL IMPACT</p>
                </div>

              </div>

            </motion.div>

          </div>

        </div>


      </div>

    </section>
  );
}