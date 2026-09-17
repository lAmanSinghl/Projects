"use client";

import React, { useState } from "react";
import Topography from "./Topography";
import FlipText from "./FlipText";
import { motion } from "motion/react";
import Burger from "@animated-burgers/burger-squeeze";
import { useNavbar } from "@/components/NavbarContext";

const Navbar = () => {
const [clicked, setClicked] = useState(false);
const [hovered, setHovered] = useState(false);

const activeTextColor = "text-white";

const { navbarTheme, start } = useNavbar();

const navbarThemes = {
    hero: {
        textColor: "text-black",
        borders: false,
    },

    dark: {
        textColor: "text-black",
        borders: false,
    },

    light: {
        textColor: "text-[#fdfaf7]",
        borders: true,
    },
};

const { textColor, borders } = navbarThemes[navbarTheme];

const handleToggle = () => {
    setClicked((prev) => !prev);
};

const menuItems = [
    {
        number: "01",
        title: "HOME",
        href: "#",
    },
    {
        number: "02",
        title: "JOURNEY",
        href: "#journey",
    },
    {
        number: "03",
        title: "SKILLS",
        href: "#skills",
    },
    {
        number: "04",
        title: "PROJECTS",
        href: "#projects",
    },
    {
        number: "05",
        title: "CONTACT",
        href: "#contact",
    },
];

return (
    <>
        {/* =========================================================
            FULLSCREEN MENU
        ========================================================= */}

        <div className="fixed inset-0 z-[80] overflow-hidden pointer-events-none">

            {/* =====================================================
                GIANT CIRCLE + TOPOGRAPHY

                The giant circle keeps the original circular
                reveal animation.

                Topography is contained to the viewport size so
                it does not scale with the giant circle.
            ===================================================== */}

<div className={`absolute left-1/2 top-1/2 z-[10] h-[600vmax] w-[600vmax] rounded-full overflow-hidden bg-[#282C20] transition-transform ease-in-out duration-[1500ms] ${clicked ? "-translate-x-1/2 -translate-y-3/4" : "-translate-x-1/2 -translate-y-[calc(100%+100vh)] delay-[380ms]"}`} />



            {/* =====================================================
                MENU CONTENT
            ===================================================== */}

            <div className={`absolute inset-0 z-[40] px-[5vw] pt-[18vh] pb-6 text-[#fdfaf7] transition-opacity ease-out duration-[1500ms] ${clicked ? "opacity-100 pointer-events-auto delay-[450ms]" : "opacity-0"}`}>

                {/* =================================================
                    DESKTOP
                ================================================= */}

                <div className="hidden md:flex h-full gap-[7vw]">

                    {/* =================================================
                        LEFT EDITORIAL AREA
                    ================================================= */}

                    <div className="relative w-[42%] max-w-[520px] h-full flex flex-col justify-between">

                        {/* =================================================
                            MAIN VISUAL
                        ================================================= */}

                        <motion.div initial={{ opacity: 0, y: 70 }} animate={clicked ? { opacity: 1, y: 0 } : { opacity: 0, y: 70 }} transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }} className="relative w-full h-[58vh] overflow-hidden bg-[#D2FF00]">

                            <div className="absolute inset-0">
                                <Topography lowColor="#282C20" midColor="#282C20" highColor="#282C20" speed={0.15} morphAmount={4} morphSpeed={0.04} bands={4} thickness={0.035} scale={1.8} pixelSize={1} glow={0} colorMode="uniform" contrast={3} brightness={1} fillBands={false} opacity={0.18} grain={false} mouseInteraction={false} />
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                <div className="font-jetbrains font-black text-[14vw] leading-[0.7] tracking-[-0.15em] text-[#282C20]">
                                    AS
                                </div>
                            </div>

                            <div className="absolute left-5 top-5 font-jetbrains text-[9px] tracking-[0.25em] text-[#282C20]">
                                AMAN SINGH
                            </div>

                            <div className="absolute left-5 bottom-5 font-jetbrains text-[9px] tracking-[0.18em] text-[#282C20]">
                                DESIGN / CODE / MOTION
                            </div>

                            <div className="absolute right-5 top-5 font-jetbrains text-[9px] text-[#282C20]">
                                01
                            </div>

                        </motion.div>


                        {/* =================================================
                            FLOATING CARD
                        ================================================= */}

                        <motion.div initial={{ opacity: 0, scale: 0.8, x: 30 }} animate={clicked ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: 30 }} transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="absolute left-[32%] bottom-[17%] w-[12vw] h-[12vw] max-w-[170px] max-h-[170px] bg-[#fdfaf7] flex items-center justify-center overflow-hidden">

                            <div className="absolute inset-[12%] rounded-full border border-[#282C20]" />

                            <div className="absolute inset-[27%] rounded-full border border-[#282C20]" />

                            <div className="absolute inset-[42%] rounded-full border border-[#282C20]" />

                            <div className="font-jetbrains text-[9px] tracking-[0.2em] text-[#282C20]">
                                02
                            </div>

                        </motion.div>


                        {/* =================================================
                            DESCRIPTION
                        ================================================= */}

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={clicked ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 1, duration: 0.8 }} className="max-w-[330px] font-jetbrains text-[9px] leading-[1.7] tracking-[0.12em] text-[#fdfaf7]/50">

                            <span className="text-[#D2FF00]">
                                BUILDING DIGITAL EXPERIENCES.
                            </span>

                            <br />

                            FROM IDEA TO INTERACTION.

                            <br />

                            DESIGNING WITH CODE, MOTION

                            <br />

                            AND A LITTLE OBSESSION.

                        </motion.div>

                    </div>


                    {/* =================================================
                        RIGHT NAVIGATION
                    ================================================= */}

                    <div className="flex-1 flex flex-col justify-center pb-[5vh]">

                        <motion.div initial={{ opacity: 0, x: 50 }} animate={clicked ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }} transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-3 mb-5 font-jetbrains text-[9px] tracking-[0.25em] text-[#D2FF00]">

                            <span className="w-8 h-px bg-[#D2FF00]" />

                            NAVIGATION

                        </motion.div>


                        <nav>

                            {menuItems.map((item, index) => (

                                <motion.a key={item.title} href={item.href} onClick={() => setClicked(false)} initial={{ opacity: 0, x: 70 }} animate={clicked ? { opacity: 1, x: 0 } : { opacity: 0, x: 70 }} transition={{ delay: 0.6 + index * 0.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }} className="group relative flex items-center h-[clamp(70px,9vh,105px)] border-b border-[#fdfaf7]/15 overflow-hidden">

                                    {/* hover fill */}

                                    <span className="absolute inset-0 bg-[#D2FF00] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]" />

                                    {/* number */}

                                    <span className="relative z-10 w-[55px] font-jetbrains text-[9px] text-[#fdfaf7]/40 group-hover:text-[#282C20] transition-colors duration-300">
                                        {item.number}
                                    </span>

                                    {/* title */}

                                    <span className="relative z-10 font-jetbrains font-bold text-[clamp(3rem,5.4vw,6rem)] leading-none tracking-[-0.08em] text-[#fdfaf7] group-hover:text-[#282C20] transition-colors duration-300">
                                        {item.title}
                                    </span>

                                    {/* arrow */}

                                    <span className="relative z-10 ml-auto mr-2 font-jetbrains text-xl text-[#fdfaf7]/40 group-hover:text-[#282C20] group-hover:translate-x-2 transition-all duration-300">
                                        ↗
                                    </span>

                                </motion.a>

                            ))}

                        </nav>

                    </div>

                </div>


                {/* =====================================================
                    MOBILE
                ===================================================== */}

                <div className="md:hidden h-full flex flex-col">

                    {/* =================================================
                        MOBILE HEADING
                    ================================================= */}

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={clicked ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ delay: 0.55, duration: 0.8 }} className="flex items-center gap-3 mb-8 font-jetbrains text-[9px] tracking-[0.25em] text-[#D2FF00]">

                        <span className="w-6 h-px bg-[#D2FF00]" />

                        NAVIGATION

                    </motion.div>


                    {/* =================================================
                        MOBILE BACKGROUND AS
                    ================================================= */}

                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={clicked ? { opacity: 0.055, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ delay: 0.5, duration: 1 }} className="absolute right-[-12vw] top-[15vh] pointer-events-none font-jetbrains font-black text-[70vw] leading-none tracking-[-0.15em] text-[#D2FF00]">
                        AS
                    </motion.div>


                    {/* =================================================
                        MOBILE LINKS
                    ================================================= */}

                    <nav className="relative z-10">

                        {menuItems.map((item, index) => (

                            <motion.a key={item.title} href={item.href} onClick={() => setClicked(false)} initial={{ opacity: 0, y: 35 }} animate={clicked ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }} transition={{ delay: 0.6 + index * 0.07, duration: 0.75, ease: [0.22, 1, 0.36, 1] }} className="flex items-center h-[11vh] min-h-[65px] border-b border-[#fdfaf7]/15">

                                <span className="w-9 font-jetbrains text-[8px] text-[#fdfaf7]/40">
                                    {item.number}
                                </span>

                                <span className="font-jetbrains font-bold text-[clamp(2.5rem,11vw,4rem)] leading-none tracking-[-0.08em] text-[#fdfaf7]">
                                    {item.title}
                                </span>

                                <span className="ml-auto font-jetbrains text-lg text-[#D2FF00]">
                                    ↗
                                </span>

                            </motion.a>

                        ))}

                    </nav>


                    {/* =================================================
                        MOBILE FOOTER
                    ================================================= */}

                    <motion.div initial={{ opacity: 0 }} animate={clicked ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: 1.1, duration: 0.9 }} className="mt-auto flex justify-between font-jetbrains text-[8px] tracking-[0.15em] text-[#fdfaf7]/40">

                        <div>
                            DESIGN
                            <br />
                            DEVELOP
                            <br />
                            EXPERIMENT
                        </div>

                        <div className="text-right">
                            AMAN SINGH
                            <br />
                            INDIA / 2026
                        </div>

                    </motion.div>

                </div>

            </div>

        </div>


        {/* =========================================================
            NAVBAR
        ========================================================= */}

        <div className="fixed top-0 left-0 z-[99] w-[96%] mx-[2%] mt-1 h-16 lg:w-[95%] lg:mx-[2.5%] lg:mt-3 lg:h-16 transition-all duration-300">

            {/* =====================================================
                LOGO

                TABLET / IPAD:
                TRUE CENTER

                LAPTOP:
                LEFT
            ===================================================== */}

            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 lg:left-0 lg:translate-x-0 transition-all delay-300 ease-in duration-200">

                <motion.div initial="initial" whileHover="hovered" className={`font-jetbrains text-center flex justify-center items-center text-5xl flex-col scale-y-70 ${clicked ? activeTextColor : textColor} transition-all delay-300 ease-in duration-200 ${start ? "gap-0" : "gap-1"}`}>

                    <FlipText text="AMAN" className={`scale-x-128 scale-y-120 ${start ? "text-5xl" : "text-[42px]"} transition-all duration-600`} />

                    <FlipText text="SINGH" className={`font-datatype scale-x-125 scale-y-125 ${start ? "text-5xl" : "text-[42px]"} transition-all duration-600`} />

                </motion.div>

            </div>


            {/* =====================================================
                EMPTY BORDERED DIV

                TABLET / IPAD:
                LEFT

                LAPTOP:
                NEXT TO BURGER

                NO CONTENT — BORDER ONLY
            ===================================================== */}

            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 border border-black lg:left-auto lg:right-[76px]" />


            {/* =====================================================
                BURGER

                ALWAYS RIGHT
            ===================================================== */}

            <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`absolute right-0 top-1/2 -translate-y-1/2 ${start ? "w-16 h-16" : "w-15 h-15"} transition-all duration-300`}>

                <div onClick={handleToggle} className={`group/card relative left-4.25 top-px flex justify-center items-center overflow-hidden rounded-xl w-[98%] h-[97%] ${clicked ? "bg-[#F4F4ED]" : ""} cursor-pointer transition-all ease-in-out duration-900`}>

                    {/* =================================================
                        BORDER
                    ================================================= */}

                    <div className={`absolute flex justify-center items-center overflow-hidden border-4 rounded-xl ${start ? "w-[60.572945999px] h-[60.4px]" : "w-14 h-14"} ${hovered ? "border-[#D2FF00]" : ""} ${clicked ? "-z-10" : "border-black z-10"} transition-all duration-600`}>

                        {/* first liquid */}

                        <div className={`absolute w-20 h-40 rounded-full bg-[#D2FF00] ${hovered ? "translate-y-0" : "-translate-y-full"} ${borders ? "opacity-0" : "opacity-100"} transition-all ease-in-out duration-900 delay-100`} />


                        {/* second liquid */}

                        <div className={`absolute w-20 h-40 rounded-full bg-[#D2FF00] -translate-y-full ${borders ? "opacity-100" : "opacity-0"} transition-all ease-in-out duration-900 delay-100`} />

                    </div>


                    {/* =================================================
                        OPEN LIME
                    ================================================= */}

                    <div className={`absolute w-20 h-40 rounded-full bg-[#D2FF00] ${hovered ? "translate-y-0" : "-translate-y-full"} ${clicked ? "opacity-100" : "opacity-0"} transition-all ease-in-out duration-900 delay-100 z-[9]`} />


                    {/* =================================================
                        WHITE CENTER
                    ================================================= */}

                    <div className={`absolute w-30 h-40 rounded-full bg-[#f5f5f5] ${borders ? "translate-y-0" : "-translate-y-full"} transition-all ease-in-out duration-[1800ms] z-[15]`} />


                    {/* =================================================
                        BURGER ICON
                    ================================================= */}

                    <div className="relative z-[20]">

                        <Burger isOpen={clicked} className={`my-burger ${clicked ? "scale-130" : ""}`} style={{ fontSize: start ? "11px" : "10px", transition: "font-size 300ms" }} />

                    </div>

                </div>

            </div>

        </div>
    </>
);
};

export default Navbar;
