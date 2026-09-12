"use client";

import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";

import { useRef, useState, useEffect } from "react";

import Topography from "@/components/Topography";
import Navbar from "@/components/Navbar";

import IntroSection from "@/components/sections/IntroSection";
import HeroSection from "@/components/sections/HeroSection";
import JourneySection from "@/components/sections/JourneySection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ConclusionSection from "@/components/sections/ConclusionSection";

import { NavbarProvider, useNavbar } from "@/components/NavbarContext";


function HomeContent() {

  const heroRef = useRef(null);
  const horizontalRef = useRef(null);
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const conclusionRef = useRef(null);


  /*
   * =====================================================
   * GLOBAL BACKGROUND
   * =====================================================
   */

  const topographyColor = useMotionValue("#D2FF00");
  const bgOverlayOpacity = useMotionValue(0);

  const projectsActive = useRef(false);


  /*
   * =====================================================
   * MAIN SCROLL
   * =====================================================
   */

  const { scrollYProgress: mainScroll } = useScroll();

  const [scrolling, setScrolling] = useState(false);


  /*
   * =====================================================
   * SCROLLING INDICATOR
   * =====================================================
   */

  useEffect(() => {

    let timeout;

    const handleScroll = () => {

      setScrolling(true);

      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setScrolling(false);
      }, 200);

    };


    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });


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


  /*
   * =====================================================
   * SECTION PROGRESS
   * =====================================================
   */

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


  const { scrollYProgress: projectsProgress } = useScroll({
    target: projectsRef,
    offset: ["start end", "end start"],
  });


  /*
   * =====================================================
   * NAVBAR
   * =====================================================
   */

  const { setNavbarTheme, setStart } = useNavbar();


  useEffect(() => {

    const updateNavbar = () => {

      const hero = scrollYProgress.get();
      const horizontal = horizontalProgress.get();
      const skills = skillsProgress.get();


      /*
       * HERO
       */

      if (hero < 0.02) {

        setNavbarTheme("dark");
        setStart(true);

        return;

      }


      setStart(false);


      /*
       * JOURNEY
       */

      if (horizontal < 0.4) {

        setNavbarTheme("light");

        return;

      }


      /*
       * SKILLS
       */

      if (skills < 0.78) {

        setNavbarTheme("dark");

      } else {

        setNavbarTheme("light");

      }

    };


    updateNavbar();


    const unsubHero = scrollYProgress.on(
      "change",
      updateNavbar
    );


    const unsubHorizontal = horizontalProgress.on(
      "change",
      updateNavbar
    );


    const unsubSkills = skillsProgress.on(
      "change",
      updateNavbar
    );


    return () => {

      unsubHero();
      unsubHorizontal();
      unsubSkills();

    };

  }, [
    scrollYProgress,
    horizontalProgress,
    skillsProgress,
    setNavbarTheme,
    setStart,
  ]);


  /*
   * =====================================================
   * BACKGROUND TRANSITION
   *
   * Journey still controls the background.
   *
   * BUT:
   * We don't update the expensive Topography every
   * single scroll event.
   * Updates are synchronized through requestAnimationFrame.
   * =====================================================
   */

  const backgroundFrame = useRef(null);
  const latestHorizontal = useRef(
    horizontalProgress.get()
  );


  const updateTopographyColor = (latest) => {

    if (projectsActive.current) {
      return;
    }


    latestHorizontal.current = latest;


    /*
     * Prevent multiple background calculations
     * inside the same browser frame.
     */

    if (backgroundFrame.current) {
      return;
    }


    backgroundFrame.current = requestAnimationFrame(() => {

      backgroundFrame.current = null;


      const progress = latestHorizontal.current;


      const rawT = Math.min(
        Math.max((progress - 0.3) / 0.5, 0),
        1
      );


      /*
       * Smoothstep
       */

      const t = rawT * rawT * (3 - 2 * rawT);


      const r = Math.round(210 * (1 - t));
      const g = Math.round(255 * (1 - t));


      const color =
        `#${r.toString(16).padStart(2, "0")}` +
        `${g.toString(16).padStart(2, "0")}` +
        "00";


      topographyColor.set(color);

      bgOverlayOpacity.set(t);

    });

  };


  /*
   * =====================================================
   * JOURNEY → BACKGROUND
   * =====================================================
   */

  useMotionValueEvent(
    horizontalProgress,
    "change",
    updateTopographyColor
  );


  /*
   * =====================================================
   * INITIAL BACKGROUND STATE
   *
   * IMPORTANT:
   * This is inside an effect instead of running
   * during React render.
   * =====================================================
   */

  useEffect(() => {

    updateTopographyColor(
      horizontalProgress.get()
    );


    return () => {

      if (backgroundFrame.current) {

        cancelAnimationFrame(
          backgroundFrame.current
        );

        backgroundFrame.current = null;

      }

    };

  }, [horizontalProgress]);


  /*
   * =====================================================
   * PROJECTS BACKGROUND SWITCH
   * =====================================================
   */

  useMotionValueEvent(
    projectsProgress,
    "change",
    (latest) => {

      const PROJECTS_ENTER = 0.30;
      const PROJECTS_LEAVE = 0.25;


      /*
       * PROJECTS TAKES OVER
       */

      if (
        latest >= PROJECTS_ENTER &&
        !projectsActive.current
      ) {

        projectsActive.current = true;


        topographyColor.set("#D2FF00");
        bgOverlayOpacity.set(0);


        return;

      }


      /*
       * PROJECTS HAS BEEN LEFT
       */

      if (
        latest <= PROJECTS_LEAVE &&
        projectsActive.current
      ) {

        projectsActive.current = false;


        updateTopographyColor(
          horizontalProgress.get()
        );

      }

    }
  );


  return (
    <>

      <Navbar />


      {/* =====================================================
          SCROLL INDICATOR
      ===================================================== */}

      <motion.div
        animate={{
          opacity: scrolling ? 1 : 0,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        style={{
          y,
        }}
        className="fixed right-0 h-13 w-1.5 rounded-full bg-white mix-blend-difference z-9999 pointer-events-none"
      />


      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 -z-10 bg-[#282C20]">

        <motion.div
          style={{
            opacity: bgOverlayOpacity,
          }}
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


      {/* =====================================================
          HERO
      ===================================================== */}

      <HeroSection
        heroRef={heroRef}
      />


      {/* =====================================================
          INTRO
      ===================================================== */}

      <IntroSection />


      {/* =====================================================
          JOURNEY
      ===================================================== */}

      <JourneySection
        horizontalRef={horizontalRef}
      />


      {/* =====================================================
          SKILLS
      ===================================================== */}

      <SkillsSection
        skillsRef={skillsRef}
      />


      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <ProjectsSection
        projectsRef={projectsRef}
      />


      {/* =====================================================
          CONCLUSION
      ===================================================== */}

      <ConclusionSection
        conclusionRef={conclusionRef}
      />

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