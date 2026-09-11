"use client";
import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Topography from "@/components/Topography";
import Navbar from "@/components/Navbar";
import IntroSection from "@/components/sections/IntroSection";
import HeroSection from "@/components/sections/HeroSection";
import { NavbarProvider, useNavbar } from "@/components/NavbarContext";
import JourneySection from "@/components/sections/JourneySection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ConclusionSection from "@/components/sections/ConclusionSection";
function HomeContent() {
  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const conclusionRef = useRef(null);
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

  const { setNavbarTheme, setStart } = useNavbar();

  useEffect(() => {
    const updateNavbar = () => {
      const hero = scrollYProgress.get();
      const horizontal = horizontalProgress.get();
      const skills = skillsProgress.get();

      // HERO — only while we're right at the top
      if (hero < 0.02) {
        setNavbarTheme("dark");
        setStart(true);
        return;
      }

      // Everything after the top uses the normal navbar
      setStart(false);

      // JOURNEY
      if (horizontal < 0.4) {
        setNavbarTheme("light");
        return;
      }

      // AFTER JOURNEY → SKILLS
      if (skills < 0.78) {
        setNavbarTheme("dark");
      } else {
        setNavbarTheme("light");
      }
    };

    // Set initial state immediately
    updateNavbar();

    const unsubHero = scrollYProgress.on("change", updateNavbar);
    const unsubHorizontal = horizontalProgress.on("change", updateNavbar);
    const unsubSkills = skillsProgress.on("change", updateNavbar);

    return () => {
      unsubHero();
      unsubHorizontal();
      unsubSkills();
    };
  }, [
    scrollYProgress,
    horizontalProgress,
    skillsProgress,
  ]);


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

      <motion.div animate={{ opacity: scrolling ? 1 : 0, }} transition={{ duration: 0.5, ease: "easeOut", }} style={{ y }} className="fixed right-0  h-13 w-1.5 rounded-full bg-white mix-blend-difference z-9999 pointer-events-none" />

      <div className="fixed inset-0 -z-10 bg-[#282C20]">
        <motion.div style={{ opacity: bgOverlayOpacity }} className="absolute inset-0 bg-[#fdfaf7]" />
        <Topography color={topographyColor}
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
          mouseInteraction={false} />
      </div>

      <HeroSection heroRef={heroRef} />

      <IntroSection />

      <JourneySection
        horizontalRef={horizontalRef}
      />

      <SkillsSection skillsRef={skillsRef} />

<ProjectsSection projectsRef={projectsRef} />

<ConclusionSection conclusionRef={conclusionRef} />

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
