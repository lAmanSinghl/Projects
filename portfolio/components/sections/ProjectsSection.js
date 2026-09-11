"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";

export default function ProjectsSection({ projectsRef }) {
  const { scrollYProgress } = useScroll({
    target: projectsRef,
    offset: ["start end", "end start"],
  });

  /*
   * PROJECT 01
   * Slower, more deliberate exit.
   */

  const projectOneY = useTransform(
    scrollYProgress,
    [0, 0.35, 0.52, 0.62],
    ["0vh", "0vh", "-30vh", "-100vh"]
  );

  const projectOneOpacity = useTransform(
    scrollYProgress,
    [0, 0.48, 0.62],
    [1, 1, 0]
  );

  const projectOneScale = useTransform(
    scrollYProgress,
    [0, 0.48, 0.62],
    [1, 1, 0.94]
  );

  /*
   * PROJECT 02
   *
   * Clean single entrance.
   * No stagger.
   * Reaches the center and holds.
   */

  const projectTwoY = useTransform(
    scrollYProgress,
    [0.50, 0.64],
    ["65vh", "0vh"]
  );

  const projectTwoOpacity = useTransform(
    scrollYProgress,
    [0.50, 0.60],
    [0, 1]
  );

  const projectTwoScale = useTransform(
    scrollYProgress,
    [0.50, 0.64],
    [0.96, 1]
  );

  /*
   * CURVED ENDING
   *
   * The curve gets deeper as the Projects section
   * reaches its end.
   */

const curveDepth = useTransform(
  scrollYProgress,
  [0.78, 0.84, 0.92, 1],
  [0, 20, 55, 90]
);
const curveScale = useTransform(
  scrollYProgress,
  [0.78, 1],
  [125 / 150, 1]
);

  const curvePath = useTransform(
    curveDepth,
    (depth) =>
      `M0 0
       L1440 0
       C1080 ${depth}
        360 ${depth}
        0 0
       Z`
  );
  const curveHeight = useTransform(
  scrollYProgress,
  [0.75, 1],
  [125, 180]
);
  return (
    <section
      ref={projectsRef}
      className="relative h-[calc(360vh+180px)] -mt-[100vh] z-20"
    >

      {/* =====================================================
          CONTINUOUS GRID

          One grid for the entire Projects section.

          It covers:
          - Project area
          - Closing footer
          - Curved ending

          This is intentionally OUTSIDE the sticky viewport.
      ===================================================== */}

      <div className="absolute inset-0 pointer-events-none z-10">

        {/* Vertical lines */}

        <div className="absolute left-[4vw] top-0 bottom-0 border-l border-white/[0.04]" />

        <div className="absolute left-[25vw] top-0 bottom-0 border-l border-white/[0.04]" />

        <div className="absolute left-[50vw] top-0 bottom-0 border-l border-white/[0.04]" />

        <div className="absolute left-[75vw] top-0 bottom-0 border-l border-white/[0.04]" />

        <div className="absolute right-[4vw] top-0 bottom-0 border-r border-white/[0.04]" />

        {/* Horizontal lines */}

        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent calc(20vh - 1px), rgba(255,255,255,0.04) 20vh, transparent calc(20vh + 1px))",
          }}
        />
      </div>


      {/* =====================================================
          PROJECT AREA
          300vh
      ===================================================== */}

      <div className="relative h-[300vh] bg-[#111112]">

        {/* =====================================================
            STICKY PROJECT VIEWPORT
        ===================================================== */}

        <div className="sticky top-0 h-screen overflow-hidden z-20">

          {/* =====================================================
              PROJECT 01
          ===================================================== */}

          <motion.article
            style={{
              y: projectOneY,
              opacity: projectOneOpacity,
              scale: projectOneScale,
            }}
            className="absolute inset-0 z-20"
          >

            {/* NUMBER */}

            <div className="absolute left-[5vw] top-[18vh]">

              <div className="font-mono text-xs tracking-[0.2em] text-white/40">
                / 01
              </div>

              <div className="h-20 w-px bg-white/20 mt-4" />

              <div className="font-mono text-[9px] tracking-[0.25em] leading-5 text-white/25 mt-4">
                BUILD
                <br />
                LEARN
                <br />
                IMPROVE
              </div>

            </div>


            {/* PROJECT 01 INFO */}

            <motion.div
              className="absolute left-[12vw] top-1/2 -translate-y-1/2 w-[25vw]"
              whileHover={{ x: 5 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
              }}
            >

              <div className="flex items-center gap-2 mb-4">

                <motion.span
                  className="w-2 h-2 rounded-full bg-[#D2FF00]"
                  animate={{
                    scale: [1, 1.35, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                  / DEVELOPMENT
                </span>

              </div>


              <h2 className="text-white text-5xl font-bold tracking-tight">
                Project
                <span className="text-[#D2FF00]">
                  .
                </span>
              </h2>


              <p className="text-white/45 text-sm leading-6 mt-4 max-w-[300px]">
                A digital experience built with a focus on interaction,
                performance and detail.
              </p>


              <div className="flex gap-2 flex-wrap mt-6">

                {["Next.js", "React", "Motion"].map((item) => (
                  <motion.span
                    key={item}
                    whileHover={{
                      y: -3,
                      borderColor: "#D2FF00",
                      color: "#D2FF00",
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="border border-white/15 rounded-full px-3 py-1 text-[10px] text-white/50 cursor-default"
                  >
                    {item}
                  </motion.span>
                ))}

              </div>


              <motion.div
                className="inline-block mt-7"
                whileHover={{ x: 6 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                }}
              >

                <span className="text-white text-sm border-b border-[#D2FF00] pb-2">
                  View Project ↗
                </span>

              </motion.div>

            </motion.div>


            {/* =================================================
                PROJECT 01 VISUAL
            ================================================= */}

            <motion.div
              className="absolute left-[43vw] top-1/2 -translate-y-1/2 w-[50vw] h-[64vh]"
              whileHover={{
                rotate: -1,
                scale: 1.015,
                y: -6,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
            >

              <div className="absolute inset-0 rounded-xl border border-white/15 bg-[#181819] overflow-hidden shadow-2xl">

                {/* Browser bar */}

                <div className="h-10 border-b border-white/10 flex items-center px-5 gap-2">

                  <span className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="w-2 h-2 rounded-full bg-white/20" />

                  <span className="ml-auto font-mono text-[8px] text-white/25">
                    PROJECT / 01
                  </span>

                </div>


                {/* Browser content */}

                <div className="p-10">

                  <div className="text-white/30 text-[10px] tracking-widest">
                    DIGITAL PRODUCT
                  </div>


                  <div className="text-white text-5xl font-bold mt-7 leading-[0.95]">

                    Build things

                    <br />

                    that feel

                    <span className="text-[#D2FF00]">
                      {" "}right.
                    </span>

                  </div>


                  <div className="mt-10 h-44 border border-white/10 rounded-lg relative overflow-hidden">

                    <motion.div
                      className="absolute left-8 top-8 h-3 bg-white/20 rounded-full"
                      animate={{
                        width: [120, 180, 120],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />

                    <div className="absolute left-8 top-16 w-48 h-2 bg-white/10 rounded-full" />

                    <motion.div
                      className="absolute right-10 top-7 w-20 h-20 rounded-full border border-[#D2FF00]/40"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />

                  </div>

                </div>

              </div>

            </motion.div>


            {/* RIGHT SIDE */}

            <div className="absolute right-[5vw] top-[35vh]">

              <div className="font-mono text-[9px] tracking-[0.25em] leading-5 text-white/25">

                IDEAS
                <br />
                INTO
                <br />
                INTERFACES

              </div>

            </div>

          </motion.article>


          {/* =====================================================
              PROJECT 02
          ===================================================== */}

          <motion.article
            style={{
              y: projectTwoY,
              opacity: projectTwoOpacity,
              scale: projectTwoScale,
            }}
            className="absolute inset-0 z-20"
          >

            {/* NUMBER */}

            <div className="absolute right-[5vw] top-[18vh]">

              <div className="font-mono text-xs tracking-[0.2em] text-white/40">
                / 02
              </div>

              <div className="h-20 w-px bg-white/20 mt-4" />

              <div className="font-mono text-[9px] tracking-[0.25em] leading-5 text-white/25 mt-4">

                CREATE
                <br />
                EXPLORE
                <br />
                EXPRESS

              </div>

            </div>


            {/* =================================================
                PROJECT 02 VISUAL
                Vertically centered.
            ================================================= */}

            <motion.div
              className="absolute left-[6vw] top-1/2 -translate-y-1/2 w-[51vw] h-[62vh]"
              whileHover={{
                rotate: 1,
                scale: 1.015,
                y: -6,
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
            >

              <div className="absolute inset-0 rounded-xl border border-white/15 bg-[#e9e9e7] overflow-hidden shadow-2xl">

                {/* Browser bar */}

                <div className="h-10 border-b border-black/10 flex items-center px-5 gap-2">

                  <span className="w-2 h-2 rounded-full bg-black/20" />
                  <span className="w-2 h-2 rounded-full bg-black/20" />
                  <span className="w-2 h-2 rounded-full bg-black/20" />

                  <span className="ml-auto font-mono text-[8px] text-black/30">
                    PROJECT / 02
                  </span>

                </div>


                {/* Browser content */}

                <div className="p-10 text-black">

                  <div className="text-black/35 text-[10px] tracking-widest">
                    CREATIVE TOOL
                  </div>


                  <div className="text-5xl font-bold mt-7 leading-[0.95]">

                    Turn ideas

                    <br />

                    into visuals.

                  </div>


                  <div className="grid grid-cols-2 gap-3 mt-8">

                    {[1, 2, 3, 4].map((item) => (
                      <motion.div
                        key={item}
                        className="h-28 bg-black/10 rounded-lg"
                        whileHover={{
                          scale: 1.04,
                          rotate: item % 2 ? -1 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                        }}
                      />
                    ))}

                  </div>

                </div>

              </div>

            </motion.div>


            {/* PROJECT 02 INFO */}

            <motion.div
              className="absolute left-[62vw] top-1/2 -translate-y-1/2 w-[27vw]"
              whileHover={{ x: -5 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 20,
              }}
            >

              <div className="flex items-center gap-2 mb-4">

                <motion.span
                  className="w-2 h-2 rounded-full bg-[#D2FF00]"
                  animate={{
                    scale: [1, 1.35, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />

                <span className="font-mono text-[10px] tracking-[0.2em] text-white/40">
                  / WEB EXPERIENCE
                </span>

              </div>


              <h2 className="text-white text-5xl font-bold tracking-tight">

                Project Two

                <span className="text-[#D2FF00]">
                  .
                </span>

              </h2>


              <p className="text-white/45 text-sm leading-6 mt-4 max-w-[300px]">
                An experimental interface exploring visual systems,
                movement and usability.
              </p>


              <div className="flex gap-2 flex-wrap mt-6">

                {["React", "Tailwind", "GSAP"].map((item) => (
                  <motion.span
                    key={item}
                    whileHover={{
                      y: -3,
                      borderColor: "#D2FF00",
                      color: "#D2FF00",
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className="border border-white/15 rounded-full px-3 py-1 text-[10px] text-white/50 cursor-default"
                  >
                    {item}
                  </motion.span>
                ))}

              </div>


              <motion.div
                className="inline-block mt-7"
                whileHover={{ x: 6 }}
              >

                <span className="text-white text-sm border-b border-[#D2FF00] pb-2">
                  View Project ↗
                </span>

              </motion.div>

            </motion.div>

          </motion.article>


          {/* =====================================================
              PROJECT VIEWPORT FOOTER
          ===================================================== */}

          <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end pointer-events-none z-30">

            <div className="font-mono text-[8px] tracking-[0.2em] text-white/25">

              AMAN SINGH

              <br />

              SELECTED WORK

            </div>


            <div className="font-mono text-[8px] tracking-[0.2em] text-white/25">

              01 — 02

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          PROJECTS CLOSING FOOTER

          60vh.
          The same continuous grid passes through it.
      ===================================================== */}

      <footer className="relative h-[60vh] bg-[#111112]">

        <div className="relative z-30 h-full flex flex-col items-center justify-center text-center">

          <div className="text-[#D2FF00] text-xl leading-none mb-5">
            ✦
          </div>


          <h2 className="font-serif text-[clamp(24px,2.8vw,42px)] leading-[0.95] tracking-[-0.03em] text-white">

            See more work and ideas

            <br />

            from Aman.

          </h2>


          <a
            href="#projects"
            className="mt-6 inline-flex items-center gap-2 bg-[#D2FF00] px-5 py-3 font-mono text-[9px] font-bold tracking-[0.08em] text-black transition-transform duration-300 hover:scale-105"
          >

            VIEW ALL WORK

            <span>↗</span>

          </a>

        </div>

      </footer>


      {/* =====================================================
          CURVED TRANSITION

          The curve stays underneath the continuous grid,
          so the grid remains visible inside the curve.
      ===================================================== */}

<div className="relative h-[150px] pointer-events-none z-0">
  <motion.div
    className="absolute inset-x-0 top-0 h-[150px]"
    style={{
      scaleY: curveScale,
      transformOrigin: "top",
    }}
  >
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <motion.path
        d={curvePath}
        fill="#111112"
      />
    </svg>
  </motion.div>
</div>

    </section>
  );
}