"use client";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Topography from "@/components/Topography";
import Navbar from "@/components/Navbar";
import IntroSection from "@/components/sections/IntroSection";
import HeroSection from "@/components/sections/HeroSection";
import { NavbarProvider, useNavbar } from "@/components/NavbarContext";
import JourneySection from "@/components/sections/JourneySection";
import SkillsSection from "@/components/sections/SkillsSection";

function HomeContent() {
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const skillsRef = useRef(null);
  const topographyColor = useMotionValue("#D2FF00");
  const bgOverlayOpacity = useMotionValue(0);
  const { scrollYProgress: mainScroll } = useScroll();
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
    mainScroll,
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
  const { setNavbarTheme, setStart } = useNavbar();

  useEffect(() => {
    const updateNavbar = () => {
      const hero = scrollYProgress.get();
      const horizontal = horizontalProgress.get();
      const skills = skillsProgress.get();

      if (hero < 0.02) {
        setNavbarTheme("dark");
        setStart(true);
      } else {
        setStart(false);

        if (horizontal < 0.4) {
          setNavbarTheme("light");
        } else if (skills < 0.6) {
          setNavbarTheme("dark");
        } else {
          setNavbarTheme("light");
        }
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

  const coverY = useTransform(
    skillsStickyProgress,
    [0.07, 0.99],
    ["100%", "0%"]
  );

  const updateTopographyColor = (latest) => {
    const rawT = Math.min(
      Math.max((latest - 0.3) / 0.5, 0),
      1
    );

    const t = rawT * rawT * (3 - 2 * rawT);

    const r = Math.round(210 * (1 - t));
    const g = Math.round(255 * (1 - t));



    topographyColor.set(
      `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}00`
    );

    bgOverlayOpacity.set(t);
  };

  useMotionValueEvent(horizontalProgress, "change", updateTopographyColor);
  updateTopographyColor(horizontalProgress.get());

  return (
    <>

      <Navbar />

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
          bands={4}
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

      <HeroSection
        heroRef={heroRef}
        scrollYProgress={scrollYProgress}
      />

      <IntroSection />

      <JourneySection
        horizontalRef={horizontalRef}
        horizontalProgress={horizontalProgress}
      />

      <SkillsSection
        skillsRef={skillsRef}
        leftX={leftX}
        leftTX={leftTX}
        rightX={rightX}
        rightTX={rightTX}
        coverY={coverY}
        isInView={isInView}
      />
      <section className="h-screen"></section>


    </>
  );
}


export default function Home() {
  return (
    <NavbarProvider>
      <HomeContent />
    </NavbarProvider>
  );
}
