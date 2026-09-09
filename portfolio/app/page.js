"use client";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionValueEvent, useMotionTemplate, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Topography from "@/components/Topography";
import Signature from "@/components/Signature";
import Skill from "@/components/Skill.js";
import Project from "@/components/Project.js"
import Navbar from "@/components/Navbar";
import RevealText from "@/components/Reveal";
import HorizontalReveal from "@/components/HorizontalReveal";
import CardSwap, { Card } from '@/components/Cardswap'
export default function Home() {
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const skillsRef = useRef(null);
  const gridColor = useMotionValue("210, 255, 0");
  const gridOpacity = useMotionValue(0.15);
  const topographyColor = useMotionValue("#D2FF00");
  const bgOverlayOpacity = useMotionValue(0);
  const { scrollYProgress: MainScrool } = useScroll();
  const [scrolling, setScrolling] = useState(false);
  useEffect(() => {
    let timeout;

    const handleScroll = () => {
      setScrolling(true);

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setScrolling(false);
      }, 200); // fade out after 500ms of no scrolling
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const y = useTransform(
    MainScrool,
    [0, 1],
    ["20vh", "85vh"]
  );
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalRef,
    offset: ["start end", "end start"],
  });
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
  const [start, setstart] = useState("flase")
  const [navbarTheme, setNavbarTheme] = useState("hero");
  const navbarThemes = {
    dark: {
      burgerColor: "",
      textColor: "text-black",
      borders: false,
    },

    light: {
      burgerColor: "bg-[#fdfaf7]",
      textColor: "text-[#fdfaf7]",
      borders: true,
    },
  };
  useEffect(() => {
    const updateNavbar = () => {
      const hero = scrollYProgress.get();
      const horizontal = horizontalProgress.get();
      const skills = skillsProgress.get();

      if (hero < 0.02) {
        setNavbarTheme("dark");
        setstart(true);
      } else if (horizontal < 0.4) {
        setNavbarTheme("light");
        setstart(false);
      } else if (skills < 0.6) {
        setNavbarTheme("dark");
      } else {
        setNavbarTheme("light");
      }
    };

    updateNavbar();

    const unsubHero = scrollYProgress.on("change", updateNavbar);
    const unsubHorizontal = horizontalProgress.on("change", updateNavbar);
    const unsubSkills = skillsProgress.on("change", updateNavbar);

    return () => {
      unsubHero();
      unsubHorizontal();
      unsubSkills();
    };
  }, [scrollYProgress, horizontalProgress, skillsProgress]);

  const isInView = useInView(skillsRef, {
    once: true,
    amount: 0.2,
  });
  const [gridInteractive, setGridInteractive] = useState(true);
  const p1 = useTransform(scrollYProgress, [0.15, 0.32], [0, 1]);

  const p2 = useTransform(scrollYProgress, [0.32, 0.54], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setGridInteractive(latest < 0.1);
  });
  const coverY = useTransform(
    skillsStickyProgress,
    [0.07, 0.99],
    ["100%", "0%"]
  );
  const bgColor2 = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["#fdfaf7", "#5A5D53"]
  );
  const gridOpacity2 = useTransform(
    scrollYProgress,
    [0, 0.6],
    [0.08, 0.01]
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
  const topographyOpacity = useTransform(
  smoothScale,
  [1, 0.8],
  [0.15, 0]
);
  const saturation = useTransform(
    scrollYProgress,
    [0, 0.6],
    [1, 0.25]
  );
  const imageFilter = useMotionTemplate`saturate(${saturation})`;

  const updateTopographyColor = (latest) => {
    const rawT = Math.min(
      Math.max((latest - 0.3) / 0.5, 0),
      1
    );

    const t = rawT * rawT * (3 - 2 * rawT);

    const r = Math.round(210 * (1 - t));
    const g = Math.round(255 * (1 - t));

    gridColor.set(`${r}, ${g}, 0`);

    topographyColor.set(
      `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}00`
    );

    gridOpacity.set(0.15 - t * 0.07);
    bgOverlayOpacity.set(t);
  };

  useMotionValueEvent(horizontalProgress, "change", updateTopographyColor);
  updateTopographyColor(horizontalProgress.get());

  return (
    <>

      <Navbar start={start} {...navbarThemes[navbarTheme]} />


      <motion.div
        animate={{
          opacity: scrolling ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        style={{ y }}
        className="fixed right-0  h-13 w-1.5 rounded-full bg-white mix-blend-difference z-9999 pointer-events-none"
      />
      <div className="fixed inset-0 -z-10 bg-[#282C20]">
        <motion.div
          style={{ opacity: bgOverlayOpacity }}
          className="absolute inset-0 bg-[#fdfaf7]"
        />

        <Topography
          color={topographyColor}
          lowColor="#D2FF00"
          midColor="#D2FF00"
          highColor="#D2FF00"
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
      <section ref={heroRef} className="relative h-[250vh] ">

        <div className="sticky top-0 h-screen overflow-hidden ">
          <div className="absolute z-10 flex justify-center items-center left-60 overflow-hidden w-300 top-39">
            <Signature p1={p1} p2={p2} className=" w-150  scale-170  " />
          </div>
          <div className="absolute inset-0 -z-10 pointer-events-none text-8xl flex flex-col justify-center items-center ">
            <div className="overflow-hidden w-full flex flex-col">
              <div className="ticker-track text-[#B2C73A] font-medula scale-x-250">
                <div className="ticker-group">
                  {Array(10).fill("BUILDING INTERACTIVE EXPERIENCES • ").join("")}
                </div>

                <div className="ticker-group">
                  {Array(10).fill("BUILDING INTERACTIVE EXPERIENCES • ").join("")}
                </div>
              </div>
              <div className="ticker-track2 text-[#fdfaf7ef] font-datatype scale-x-110 scale-y-85 font-semibold">
                <div className="ticker-group">
                  {Array(10).fill("BUILDING INTERACTIVE EXPERIENCES • ").join("")}
                </div>

                <div className="ticker-group">
                  {Array(10).fill("BUILDING INTERACTIVE EXPERIENCES • ").join("")}
                </div>
              </div>
            </div>

          </div>

          <motion.div style={{ scale: smoothScale, borderRadius, transformOrigin: "center center", backgroundColor: bgColor2 }} className=" h-screen overflow-hidden bg-[] flex justify-center">

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
              <motion.img style={{ filter: imageFilter }} className="relative -top-[488.8px] right-6 w-330 pointer-events-none" src="PhotoshopPreview_Image.png" alt="" />

            </div>
            <motion.div animate={{ clipPath: navbarTheme === "light" ? "circle(840px at 50% -830px)" : "circle(840px at 50% -550px)" }} transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }} className=" absolute  w-120 -right-8 -bottom-3 text-gray-700 font-jetbrains  hover:scale-125 ">
              <img src="Interactive Whiteboard in Grey Lilac Blue Modern Style (1).png" alt="" className="scale-y-85 scale-x-100" />
              <div className="absolute  top-8 left-2  font-jetbrains text-2xl scale-y-75  text-gray-700 font-semibold">ONGOING PROJECT</div>
              <img src="Interactive Whiteboard in Grey Lilac Blue Modern Style (2).png" alt="" className="w-20 absolute top-48 left-13 " />
              <img src="pixelcut-export.png" alt="" className="w-70 absolute top-34 left-50  scale-x-60 scale-y-80 " />

              <div className="name absolute top-20 left-17 text-[23px] font-bold text-black ">PORTFOLIO V3</div>

              <div className="absolute top-30 left-17 text-[12px] w-45">Building an Interactive portfolio focoused on motion and storytelling</div>

              <div className="absolute top-22 left-60 border-gray-500 border"><motion.img style={{ filter: imageFilter }} src="Screenshot 2026-05-30 194807.png" alt="" className="w-45  " /></div>

              <div className="flex items-center gap-2 absolute top-10 text-black left-83 font-semibold"><div className="w-2 h-2 rounded-[100%] bg-[#D2FF00] " /> BUILDING </div>

              <div className="absolute w-25 h-4 rounded-4xl border top-51.5 left-32  font-semibold border-gray-500 text-center flex justify-between px-1 items-center text-[12px] overflow-hidden">
                <div className="z-10">PROGRESS</div>
                <div className="z-10">50%</div>
                <div className="absolute w-25 h-4 bg-[#D2FF00] right-[101%] translate-x-1/2 z-9 m-px " ></div>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </section>
      <section className="relative min-h-screen  z-9 overflow-hidden ">
        <div className="flex h-[105vh] items-center justify-center flex-col  pt-4 scale-y-105 relative -top-2">

          <RevealText delay={0} className="px-7 z-1">
            <div className="font-datatype scale-x-105 font-bold text-8xl text-[#DDE1D2] scale-y-110 tracking-tight relative pb-1 top-2">
              BUILDING SCALABLE
            </div>
          </RevealText>

          <RevealText className="z-1">
            <div className="flex font-datatype font-bold text-8xl text-[#DDE1D2] text-center scale-y-110  justify-center items-center gap-3 "><div className=" font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-131">SOFTWARE,</div><div className="scale-x-105 felx pt-0.5 w-125 relative right- tracking-tight">CRAFTING</div></div></RevealText>

          <RevealText className="w-fit">
            <div className="font-datatype  font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex justify-center  gap-4"><div className="scale-x-105 tracking-tight felx pt-0.5 w-108 ">MODERN</div><div className=" font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-166">EXPERIENCES,</div></div></RevealText>

          <RevealText className="px-5">
            <div className="font-datatype scale-x-105 tracking-tight font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex">AND TURNING </div></RevealText>

          <RevealText>
            <div className="font-datatype  font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex gap-4"><div className=" font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-69">IDEAS</div><div className="scale-x-105 tracking-tight felx pt-0.5 w-200"> INTO PRODUCTS</div></div></RevealText>

          <RevealText className="px-6">
            <div className="font-datatype scale-x-105 tracking-tight font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex ">THAT SOLVE REAL</div></RevealText>

          <RevealText className="px-30">
            <div className=" font-bold text-8xl  text-center font-medula scale-x-180 scale-y-127 text-[#B2C73A] tracking-[3px] flex "> PROBLEMS.</div></RevealText>
        </div>
      </section>
      <section ref={horizontalRef} className="relative h-[280vh]">
        <div className="sticky top-0 h-screen overflow-hidden">

          <motion.div style={{ x: useTransform(horizontalProgress, [0, 0.75], ["0%", "-170%"]) }} className="flex">
            <section className="w-screen h-screen shrink-0 relative top-2">

              <div className=" absolute top-18 left-330  w-70 h-78  overflow-hidden rounded-xl scale-90">
                <img src="IMG_20260101_111852.jpg.jpeg" alt="" className="absolute w-200 scale-200 -top-35 right-10 " />
              </div>
              <div className="absolute text-[#B4B8A5]  left-328 top-91 w-40 scale-70">
                <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.15}><div className=" relative -left-4 text-2xl scale-y-55 scale-x-70 ">NOIDA, 2024</div></HorizontalReveal>
              </div>

              <div className=" absolute top-103 left-380  w-70 h-78  overflow-hidden rounded-xl scale-78"><img src="Screenshot_2026-06-11-12-08-43-003_com.instagram.android-edit.jpg.jpeg" style={{ filter: "grayscale(150%) sepia(50%) brightness(0.6) contrast(0.95)" }} alt="" className="absolute w-200 scale-130 -top-25 right-10 opacity-80" /></div>

              <div className="absolute text-[#B4B8A5] left-412 top-171 w-35 scale-70">
                <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.15}><div className=" relative left-5 text-2xl scale-y-55 scale-x-70 ">JAIPUR, 2018</div></HorizontalReveal>
              </div>


              <div className="relative top-70 left-430 w-fit scale-70 font-datatype text-[#B4B8A5] ">
                <img src="952101786200610_School_Photo_2026.jpg" alt="" className="rounded-xl w-222 relative " />
                <div className="absolute bottom-123 -left-1 w-80 ">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.15}><div className=" relative -left-10 text-2xl scale-y-55 scale-x-70 ">MUGHALSARAI, 2008-2022</div></HorizontalReveal>
                </div>
                <div className="absolute -top-95">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.05}><div className="font-medula text-5xl">SUNBEAM SCHOOL MUGHALSARAI</div></HorizontalReveal>
                </div>
                <div className="absolute -top-82 font-medula text-4xl"><HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.09}>A chapter of growth, discovery, and the first steps toward technology and innovation.It was during these years that I developed a strong academic foundation, learned the value of discipline, and discovered a curiosity for problem-solving. Beyond the classroom, the experiences, friendships, and challenges shaped the mindset that continues to guide me today.</HorizontalReveal></div>

                <div className="w-full flex absolute justify-between -top-41   font-medula text-4xl">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.09}><div className="">CLASS 10 (2019-20)</div></HorizontalReveal>
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.09}><div>87%</div></HorizontalReveal>
                </div>
                <div className="w-full flex absolute justify-between -top-31   font-medula text-4xl">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.09}><div className="">CLASS 12 (2021-22)</div></HorizontalReveal>
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.09}><div>80%</div></HorizontalReveal>
                </div>
              </div>

              <div className=" absolute top-14 left-634  w-70 h-78  overflow-hidden rounded-xl scale-78"><img src="IMG_20250203_024609.jpg.jpeg" style={{ filter: "grayscale(100%) sepia(10%) brightness(1)" }} alt="" className="absolute w-200 scale-130 -top-25 right-10 opacity-90" /></div>
              <div className="absolute text-[#4a4b48]  left-635 top-82 w-42 scale-70">
                <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.45}><div className=" relative -left-4 text-2xl scale-y-55 scale-x-70 ">PUSHKAR, 2024</div></HorizontalReveal>
              </div>
              <div className=" absolute top-92 left-680  w-60 h-78  overflow-hidden rounded-xl "><img src="SAVE_20260908_154138.jpg.jpeg" alt="" className="absolute w-200 scale-160 -top-18 " /></div>
              <div className="absolute text-[#4a4b48]  left-717 top-169 w-42 scale-70">
                <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.45}><div className=" relative -left-4 text-2xl scale-y-55 scale-x-70 ">Delhi, 2025</div></HorizontalReveal>
              </div>

              <div className="absolute top-73  left-735 w-210  scale-80 font-datatype text-[#565752] ">
                <img src="a7.jpg.jpeg" alt="" className="rounded-xl w-220" />
                <div className="absolute bottom-110 -left-1 w-80 scale-y-70">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.51}><div className=" relative -left-6 text-2xl scale-y-55 scale-x-70 text-[#4a4b48]">NOIDA, 20023-2027</div></HorizontalReveal>
                </div>
                <div className="absolute -top-78">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.51}><div className="font-medula text-5xl">JSS Academy of Technical Education</div></HorizontalReveal>
                </div>
                <div className="absolute -top-65 font-medula text-4xl"><HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.49}>A period of exploration, innovation, and turning knowledge into practice.Through academics, projects, and hands-on development, I gained the skills to build meaningful software and tackle complex challenges.</HorizontalReveal>
                </div>
                <div className="w-full flex absolute justify-between -top-35   font-medula text-4xl">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.51}><div className="">1rst year</div></HorizontalReveal>
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.59}><div>7.205</div></HorizontalReveal>
                </div>
                <div className="w-full flex absolute justify-between -top-28   font-medula text-4xl">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.51}><div className="">2nd year</div></HorizontalReveal>
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.59}><div>7.770</div></HorizontalReveal>
                </div>
                <div className="w-full flex absolute justify-between -top-21   font-medula text-4xl">
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.51}><div className="">3nd year</div></HorizontalReveal>
                  <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.59}><div>7.940</div></HorizontalReveal>
                </div>
              </div>

              <div className=" absolute top-54 left-930  w-67 h-48  overflow-hidden rounded-xl "><img src="IMG_20250202_231904.jpg.jpeg" alt="" className="absolute w-200 scale-160 -top-36  " style={{ filter: "grayscale(150%) sepia(10%) brightness(1)" }} /></div>
              <div className="absolute top-47 left-921 w-60   scale-70 text-[#4a4b48]">
                <HorizontalReveal progress={horizontalProgress} color="#D5F831" trigger={0.65}><div className=" relative -left-7 text-2xl scale-y-55 scale-x-70 ">NOIDA, 20023-2027</div></HorizontalReveal>
              </div>
            </section>
          </motion.div>
        </div>
      </section>
      <section ref={skillsRef} className="relative h-[160vh]">
        <div className="sticky top-0 h-screen overflow-hidden ">
          <div className="h-screen w-screen flex justify-center items-center  text-[#282C20] ">
            <motion.div className=" font-medula text-6xl  scale-260 font-bold relative -top-45">
              SKILLS
              <div className="w-200 absolute -left-44 -top-32 ">
                <Skill isInView={isInView} />
              </div>
            </motion.div>
            <div className="absolute top-95 text-[#282C20] flex gap-60 ">
              <motion.div style={{ x: leftTX }} className=" font-medula text-[110px] relative  font-bold w-200 flex flex-col justify-end ">

                <div className="w-full flex justify-end mb-9">
                  <RevealText color="#282C20" className="leading-none">
                    <span className="">Design</span>
                  </RevealText>
                </div>

                <div className="text-lg font-datatype w-80 font-bold text-right relative left-120 leading-5 ">

                  <RevealText color="#282C20" className="leading-none mb-1"> <span className="">Creating engaging, responsive, and </span> </RevealText>
                  <RevealText color="#282C20" className="leading-none"> <span>interactive user experiences</span></RevealText>

                </div>
                <div className="left-189 relative rounded-md h-11 w-11 flex items-center justify-center bg-[#D2FF00] mt-1">
                  <lord-icon src="https://cdn.lordicon.com/dcyiaoek.json" trigger="hover" colors="primary:#292d20" style={{ width: 15 }}></lord-icon></div>
              </motion.div>

              <motion.div style={{ x: rightTX }} className=" font-medula text-[110px]   font-bold w-200 ">
                <div className="w-fit  mb-9">
                  <RevealText color="#282C20" className="leading-none" direction="right">
                    <span className="">Develop</span>
                  </RevealText>
                </div>
                <div className="text-lg font-datatype w-80 font-bold  relative leading-5 ">

                  <RevealText color="#282C20" className="leading-none mb-1" direction="right"> <span className="">Building scalable, reliable, and</span> </RevealText>
                  <RevealText color="#282C20" className="leading-none" direction="right"> <span>performant applications.</span></RevealText>

                </div>
                <div className="text-lg font-datatype w-80 font-bold leading-5  "> </div>
                <div className="relative rounded-md h-11 w-11 flex items-center justify-center bg-[#D2FF00]  mt-1">
                  <lord-icon src="https://cdn.lordicon.com/dcyiaoek.json" trigger="hover" colors="primary:#292d20" style={{ width: 15, transform: "rotate(180deg)" }}></lord-icon>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Robot */}
          <motion.div style={{ x: leftX }} className="w-[50vw] absolute -left-82.5 -top-20">
            <img src="Adobe Express - file.png" alt="" />
          </motion.div>

          {/* Human */}
          <motion.div style={{ x: rightX }} className="w-[50vw] absolute left-279.5 overflow-hidden -top-20">
            <img src="Untitled - June 13, 2026 at 15.14.19.png" alt="" />
          </motion.div>

          <motion.div
            style={{ y: coverY }}
            className="absolute inset-0 bg-[#111112] z-9 overflow-hidden flex h-screen"
          >
            <div className=" font-medula text-6xl font-bold text-white  flex justify-center items-center h-70 relative top-11 ">

              <div className="scale-250 absolute left-170 top-25">Project</div>
              <div className="w-100 absolute left-215 top-20 rotate-3  scale-320  pointer-events-none">
                <Project />
              </div>
            </div>

            <section className="absolute h-screen">
              <div style={{ height: '600px', position: 'relative' }} className="left-380 top-20">
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
      <section className="h-screen"></section>


    </>
  );
}



