"use client";

import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";

import { useState } from "react";
import Reveal from "@/components/Reveal";

export default function ConclusionSection({ conclusionRef }) {
  const { scrollYProgress } = useScroll({
    target: conclusionRef,
    offset: ["start end", "end start"],
  });

  const introOpacity = useTransform(
    scrollYProgress,
    [0, 0.12, 0.28],
    [0, 1, 1]
  );

  const introY = useTransform(
    scrollYProgress,
    [0, 0.28],
    ["50px", "0px"]
  );

  const frameOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.28],
    [0, 1]
  );

  const frameY = useTransform(
    scrollYProgress,
    [0.08, 0.38],
    ["70px", "0px"]
  );

  const footerOpacity = useTransform(
    scrollYProgress,
    [0.58, 0.76],
    [0, 1]
  );

  return (
    <section
      ref={conclusionRef}
      className="relative z-30 min-h-[205vh] overflow-hidden bg-transparent text-[#FDFBF5]"
    >

      {/* =====================================================
          VISUAL OFFSET ONLY
      ===================================================== */}

      <div className="relative top-[40vh]">

        {/* =====================================================
            TOP LABEL
        ===================================================== */}

        <motion.div
          style={{
            opacity: introOpacity,
            y: introY,
          }}
          className="relative px-[5vw] pt-[17vh]"
        >

          <div className="flex items-center justify-between">

            <div className="font-mono text-[8px] tracking-[0.22em] text-[#FDFBF5]/75">
              <Reveal color="#D2FF00">
                03 / OPEN CHANNEL
              </Reveal>
            </div>


            <div className="flex items-center gap-3">

              <span className="h-1.5 w-1.5 rounded-full bg-[#D2FF00]" />

              <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/65">
                <Reveal color="#D2FF00" delay={0.08}>
                  CHANNEL OPEN
                </Reveal>
              </div>

            </div>

          </div>


          {/* =================================================
              MAIN INTRO
          ================================================= */}

          <div className="mt-[10vh] grid grid-cols-1 lg:grid-cols-[1fr_0.55fr]">

            <div>

              <div className="font-mono text-[8px] tracking-[0.2em] text-[#FDFBF5]/50">
                <Reveal color="#D2FF00">
                  LAST THING
                </Reveal>
              </div>


              {/* Heading is a div because Reveal itself is a div */}

              <div className="mt-5 max-w-[760px] font-serif text-[clamp(46px,6vw,88px)] leading-[0.86] tracking-[-0.05em] text-[#FDFBF5]">

                <Reveal color="#D2FF00" delay={0.08}>
                  DON'T SEND
                </Reveal>

                <Reveal color="#D2FF00" delay={0.16}>
                  A BRIEF.
                </Reveal>

                <Reveal color="#D2FF00" delay={0.24}>
                  <span className="text-[#D2FF00]">
                    SEND THE IDEA.
                  </span>
                </Reveal>

              </div>

            </div>


            <div className="mt-[6vh] max-w-[250px] lg:mt-auto lg:mb-2">

              <div className="font-mono text-[8px] tracking-[0.2em] text-[#FDFBF5]/45">
                <Reveal color="#D2FF00" delay={0.16}>
                  START ANYWHERE
                </Reveal>
              </div>


              <div className="mt-4 font-mono text-[9px] leading-5 text-[#FDFBF5]/70">

                <Reveal color="#D2FF00" delay={0.24}>
                  A product.
                </Reveal>

                <Reveal color="#D2FF00" delay={0.30}>
                  An interface.
                </Reveal>

                <Reveal color="#D2FF00" delay={0.36}>
                  An experiment.
                </Reveal>

                <Reveal color="#D2FF00" delay={0.42}>
                  Something half figured out.
                </Reveal>

              </div>


              <motion.div
                initial={{
                  scaleX: 0,
                  transformOrigin: "left",
                }}
                whileInView={{
                  scaleX: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.05,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.45,
                }}
                className="mt-6 h-px w-10 bg-[#D2FF00]"
              />

            </div>

          </div>

        </motion.div>


        {/* =====================================================
            CONTACT FRAME
        ===================================================== */}

        <motion.div
          style={{
            opacity: frameOpacity,
            y: frameY,
          }}
          className="relative mx-[5vw] mt-[13vh]"
        >
          <ContactFrame />
        </motion.div>


        {/* =====================================================
            FOOTER
        ===================================================== */}

        <motion.div
          style={{
            opacity: footerOpacity,
          }}
          className="relative mx-[5vw] mt-[13vh] pb-[7vh]"
        >

          <div className="border-t border-[#FDFBF5]/25 pt-5">

            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

              <div>

                <div className="font-mono text-[8px] tracking-[0.2em] text-[#FDFBF5]/70">
                  <Reveal color="#D2FF00">
                    AMAN SINGH
                  </Reveal>
                </div>


                <div className="mt-2 font-mono text-[8px] tracking-[0.15em] text-[#FDFBF5]/45">
                  <Reveal color="#D2FF00" delay={0.08}>
                    DESIGN / CODE / EXPERIMENTS
                  </Reveal>
                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/45">
                  <Reveal color="#D2FF00" delay={0.16}>
                    DELHI — INDIA
                  </Reveal>
                </div>


                <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/55">

                  <a
                    href="/resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#D2FF00]"
                  >
                    <Reveal color="#D2FF00" delay={0.24}>
                      CV / RESUME ↗
                    </Reveal>
                  </a>

                </div>


                <span className="h-1.5 w-1.5 rounded-full bg-[#D2FF00]" />


                <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/55">
                  <Reveal color="#D2FF00" delay={0.32}>
                    SYSTEM ONLINE
                  </Reveal>
                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}


/* ================================================= */
/* CONTACT FRAME */
/* ================================================= */

function ContactFrame() {

  const [sent, setSent] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    project: "",
    message: "",
  });


  const handleChange = (event) => {

    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

  };


  const handleSubmit = (event) => {

    event.preventDefault();

    // TEMPORARY
    // API will be connected later.

    setSent(true);

  };


  if (sent) {
    return <SuccessState />;
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="relative border border-[#FDFBF5]/35"
    >

      {/* =================================================
          CORNER MARKS
      ================================================= */}

      <div className="absolute -left-px -top-px h-3 w-3 border-l border-t border-[#FDFBF5]" />

      <div className="absolute -right-px -top-px h-3 w-3 border-r border-t border-[#FDFBF5]" />

      <div className="absolute -bottom-px -left-px h-3 w-3 border-b border-l border-[#FDFBF5]" />

      <div className="absolute -bottom-px -right-px h-3 w-3 border-b border-r border-[#FDFBF5]" />


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between border-b border-[#FDFBF5]/25 px-[5vw] py-5 lg:px-[3vw]">

        <div className="flex items-center gap-3">

          <span className="h-2 w-2 bg-[#D2FF00]" />

          <div className="font-mono text-[9px] tracking-[0.2em] text-[#FDFBF5]">
            <Reveal color="#D2FF00">
              OPEN CHANNEL
            </Reveal>
          </div>

        </div>


        <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/45">
          <Reveal color="#D2FF00" delay={0.08}>
            IN / OUT
          </Reveal>
        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr]">

        {/* LEFT */}

        <div className="border-b border-[#FDFBF5]/25 p-[5vw] lg:border-b-0 lg:border-r lg:p-[3vw]">

          <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/45">
            <Reveal color="#D2FF00">
              TRANSMISSION
            </Reveal>
          </div>


          <div className="mt-[6vh]">

            <div className="font-serif text-[clamp(34px,3.5vw,54px)] leading-[0.88] tracking-[-0.045em] text-[#FDFBF5]">

              <Reveal color="#D2FF00" delay={0.08}>
                WHAT'S
              </Reveal>

              <Reveal color="#D2FF00" delay={0.16}>
                ON YOUR
              </Reveal>

              <Reveal color="#D2FF00" delay={0.24}>
                MIND
              </Reveal>

              <Reveal color="#D2FF00" delay={0.32}>
                <span className="text-[#D2FF00]">
                  ?
                </span>
              </Reveal>

            </div>

          </div>


          <div className="mt-[8vh] max-w-[190px] font-mono text-[8px] leading-5 text-[#FDFBF5]/55">

            <Reveal color="#D2FF00" delay={0.16}>
              No formal brief.
            </Reveal>

            <Reveal color="#D2FF00" delay={0.24}>
              No perfect wording.
            </Reveal>

            <Reveal color="#D2FF00" delay={0.32}>
              Just start somewhere.
            </Reveal>

          </div>


          <div className="mt-[8vh] font-mono text-[8px] leading-4 tracking-[0.15em] text-[#FDFBF5]/35">

            <Reveal color="#D2FF00" delay={0.24}>
              01
            </Reveal>

            <Reveal color="#D2FF00" delay={0.30}>
              IDEA
            </Reveal>

            <Reveal color="#D2FF00" delay={0.36}>
              02
            </Reveal>

            <Reveal color="#D2FF00" delay={0.42}>
              CONVERSATION
            </Reveal>

          </div>

        </div>


        {/* RIGHT */}

        <div className="p-[5vw] lg:p-[3vw]">

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">

            <Field
              number="01"
              label="NAME"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
            />


            <Field
              number="02"
              label="EMAIL"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
            />

          </div>


          <div className="mt-8">

            <Field
              number="03"
              label="PROJECT"
              name="project"
              value={form.project}
              onChange={handleChange}
              placeholder="What are we making?"
            />

          </div>


          <div className="mt-8">

            <div className="mb-3 flex items-center gap-3">

              <div className="font-mono text-[8px] text-[#FDFBF5]/40">
                <Reveal color="#D2FF00">
                  04
                </Reveal>
              </div>


              <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/60">
                <Reveal color="#D2FF00" delay={0.08}>
                  MESSAGE
                </Reveal>
              </div>

            </div>


            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Start anywhere..."
              rows={6}
              className="w-full resize-none border-b border-[#FDFBF5]/30 bg-transparent py-2 font-mono text-[10px] leading-5 text-[#FDFBF5] outline-none placeholder:text-[#FDFBF5]/30 focus:border-[#D2FF00]"
            />

          </div>


          {/* SEND */}

          <div className="mt-10 flex items-end justify-between border-t border-[#FDFBF5]/20 pt-5">

            <div className="font-mono text-[8px] leading-4 text-[#FDFBF5]/40">

              <Reveal color="#D2FF00">
                DIRECT CHANNEL
              </Reveal>

              <Reveal color="#D2FF00" delay={0.08}>
                READY FOR TRANSMISSION
              </Reveal>

            </div>


            <button
              type="submit"
              className="group flex items-center gap-4 font-mono text-[9px] tracking-[0.18em] text-[#FDFBF5]"
            >

              <div>
                <Reveal color="#D2FF00">
                  TRANSMIT
                </Reveal>
              </div>


              <span className="flex h-11 w-11 items-center justify-center border border-[#FDFBF5]/40 transition-all duration-300 group-hover:border-[#D2FF00] group-hover:bg-[#D2FF00] group-hover:text-[#171717]">
                ↗
              </span>

            </button>

          </div>

        </div>

      </div>

    </form>
  );
}


/* ================================================= */
/* FIELD */
/* ================================================= */

function Field({
  number,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
}) {

  return (
    <div>

      <div className="mb-3 flex items-center gap-3">

        <div className="font-mono text-[8px] text-[#FDFBF5]/40">
          <Reveal color="#D2FF00">
            {number}
          </Reveal>
        </div>


        <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/60">
          <Reveal color="#D2FF00" delay={0.08}>
            {label}
          </Reveal>
        </div>

      </div>


      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full border-b border-[#FDFBF5]/30 bg-transparent py-2 font-mono text-[10px] text-[#FDFBF5] outline-none placeholder:text-[#FDFBF5]/30 focus:border-[#D2FF00]"
      />

    </div>
  );
}


/* ================================================= */
/* SUCCESS */
/* ================================================= */

function SuccessState() {

  return (
    <div className="min-h-[600px] p-[5vw] lg:p-[4vw]">

      <div className="flex min-h-[500px] flex-col justify-between">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <span className="h-2 w-2 bg-[#D2FF00]" />

            <div className="font-mono text-[9px] tracking-[0.2em] text-[#FDFBF5]">
              <Reveal color="#D2FF00">
                TRANSMISSION COMPLETE
              </Reveal>
            </div>

          </div>


          <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/40">
            <Reveal color="#D2FF00" delay={0.08}>
              01 / RECEIVED
            </Reveal>
          </div>

        </div>


        <div>

          <div className="font-mono text-[9px] tracking-[0.2em] text-[#FDFBF5]/50">
            <Reveal color="#D2FF00">
              MESSAGE RECEIVED
            </Reveal>
          </div>


          <div className="mt-5 font-serif text-[clamp(52px,7vw,100px)] leading-[0.82] tracking-[-0.05em] text-[#FDFBF5]">

            <Reveal color="#D2FF00" delay={0.08}>
              THAT'S
            </Reveal>

            <Reveal color="#D2FF00" delay={0.16}>
              IN
            </Reveal>

            <Reveal color="#D2FF00" delay={0.24}>
              <span className="text-[#D2FF00]">
                ↗
              </span>
            </Reveal>

          </div>

        </div>


        <div className="flex items-end justify-between">

          <div className="max-w-[240px] font-mono text-[9px] leading-5 text-[#FDFBF5]/55">

            <Reveal color="#D2FF00" delay={0.16}>
              The interface is ready.
            </Reveal>

            <Reveal color="#D2FF00" delay={0.24}>
              We'll connect the actual
            </Reveal>

            <Reveal color="#D2FF00" delay={0.32}>
              transmission layer next.
            </Reveal>

          </div>


          <div className="font-mono text-[8px] tracking-[0.18em] text-[#FDFBF5]/40">

            <Reveal color="#D2FF00" delay={0.24}>
              CHANNEL CLOSED
            </Reveal>

          </div>

        </div>

      </div>

    </div>
  );
}