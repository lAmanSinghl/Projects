"use client";

import { motion, useScroll, useTransform } from "motion/react";

export default function ConclusionSection({ conclusionRef }) {
  const { scrollYProgress } = useScroll({
    target: conclusionRef,
    offset: ["start end", "end start"],
  });

  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.3],
    [0, 1, 1]
  );

  const introY = useTransform(
    scrollYProgress,
    [0, 0.25],
    ["40px", "0px"]
  );

  const portraitOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.28],
    [0, 0.7, 1]
  );

  const portraitY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.55],
    ["45px", "0px", "-12px"]
  );

  const portraitScale = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.96, 1]
  );

  const contactOpacity = useTransform(
    scrollYProgress,
    [0.38, 0.55, 0.72],
    [0, 0.7, 1]
  );

  const contactY = useTransform(
    scrollYProgress,
    [0.38, 0.65],
    ["35px", "0px"]
  );

  const dividerScale = useTransform(
    scrollYProgress,
    [0.32, 0.48],
    [0, 1]
  );

  return (
    <section
      ref={conclusionRef}
      className="relative min-h-[175vh] overflow-visible text-[#151515]"
    >

      {/* =====================================================
          CONCLUSION
      ===================================================== */}

      <div className="relative min-h-[92vh] px-[5vw] pt-[21vh]">

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="font-mono text-[9px] tracking-[0.22em] text-[#151515]/65"
        >
          / CONCLUSION
        </motion.div>

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="relative mt-[7vh] z-10 max-w-[58vw]"
        >
          <h2 className="font-serif text-[clamp(42px,5vw,78px)] leading-[0.9] tracking-[-0.045em] text-[#151515]">
            STILL CURIOUS
            <br />
            ABOUT WHAT'S NEXT<span className="text-[#D2FF00]">?</span>
          </h2>
        </motion.div>

        <motion.div
          style={{ opacity: introOpacity, y: introY }}
          className="mt-[7vh] w-[300px]"
        >
          <div className="mb-3 font-mono text-[8px] tracking-[0.2em] text-[#151515]/55">
            / KEEP BUILDING
          </div>

          <p className="font-mono text-[10px] leading-5 text-[#151515]/75">
            There's always another idea,
            another interface, another thing
            worth making.
          </p>
        </motion.div>

        {/* =================================================
            PORTRAIT — OVERLAPS PROJECT CURVE
        ================================================= */}

        <motion.div
          style={{
            opacity: portraitOpacity,
            y: portraitY,
            scale: portraitScale,
          }}
          className="absolute z-30 right-[8vw] -top-[125px] w-[25vw] min-w-[220px] max-w-[380px]"
        >
          <img
            src="PhotoshopPreview_Image.png"
            alt="Aman Singh"
            className="block w-full h-auto object-contain"
          />
        </motion.div>

        <div className="absolute right-[5vw] bottom-[8vh] font-mono text-[8px] tracking-[0.18em] text-[#151515]/45">
          03 / 03
        </div>
      </div>


      {/* =====================================================
          DIVIDER
      ===================================================== */}

      <div className="px-[5vw]">
        <motion.div
          style={{ scaleX: dividerScale }}
          className="h-px w-full origin-left bg-[#151515]/20"
        />
      </div>


      {/* =====================================================
          CONTACT
      ===================================================== */}

      <div className="relative min-h-[83vh] px-[5vw] pt-[11vh] pb-[7vh]">

        <motion.div
          style={{ opacity: contactOpacity, y: contactY }}
          className="font-mono text-[9px] tracking-[0.22em] text-[#151515]/65"
        >
          / CONTACT
        </motion.div>

        <motion.div
          style={{ opacity: contactOpacity, y: contactY }}
          className="mt-[6vh] max-w-[50vw]"
        >
          <h3 className="font-serif text-[clamp(40px,4.8vw,74px)] leading-[0.9] tracking-[-0.045em] text-[#151515]">
            LET'S TALK<span className="text-[#D2FF00]">.</span>
          </h3>
        </motion.div>

        <motion.div
          style={{ opacity: contactOpacity, y: contactY }}
          className="mt-[5vh] ml-[25vw] w-[290px]"
        >
          <p className="font-mono text-[10px] leading-5 text-[#151515]/75">
            Got an idea, a project, or something
            interesting you want to build?
            I'd like to hear about it.
          </p>
        </motion.div>


        {/* =================================================
            CONTACT INDEX
        ================================================= */}

        <motion.div
          style={{ opacity: contactOpacity, y: contactY }}
          className="mt-[9vh] border-t border-[#151515]/20"
        >

          <ContactRow
            label="EMAIL"
            value="your@email.com"
            href="mailto:your@email.com"
          />

          <ContactRow
            label="GITHUB"
            value="lAmanSinghl"
            href="#"
          />

          <ContactRow
            label="LINKEDIN"
            value="Aman Singh"
            href="#"
          />

          <ContactRow
            label="INSTAGRAM"
            value="Aman Singh"
            href="#"
          />

        </motion.div>


        {/* =================================================
            END
        ================================================= */}

        <div className="absolute bottom-[4vh] left-[5vw] right-[5vw] flex items-end justify-between">

          <div className="font-mono text-[8px] leading-4 tracking-[0.18em] text-[#151515]/45">
            AMAN SINGH
            <br />
            DIGITAL DESIGN + DEVELOPMENT
          </div>

          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D2FF00]" />
            <span className="font-mono text-[8px] tracking-[0.18em] text-[#151515]/50">
              / END
            </span>
          </div>

        </div>

      </div>

    </section>
  );
}


/* =========================================================
   CONTACT ROW
   ========================================================= */

function ContactRow({ label, value, href }) {
  return (
    <a
      href={href}
      target={href === "#" ? undefined : "_blank"}
      rel={href === "#" ? undefined : "noreferrer"}
      className="group flex items-center justify-between border-b border-[#151515]/15 py-5"
    >

      <div className="flex items-center gap-[8vw]">

        <span className="w-[80px] font-mono text-[8px] tracking-[0.2em] text-[#151515]/55">
          {label}
        </span>

        <span className="text-[12px] text-[#151515] transition-transform duration-300 group-hover:translate-x-1">
          {value}
        </span>

      </div>

      <span className="font-mono text-[11px] text-[#151515]/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
        ↗
      </span>

    </a>
  );
}