import React, { useState, useEffect } from "react";
import Topography from "./Topography";
import FlipText from "./FlipText";
import { motion } from "motion/react";
import Burger from '@animated-burgers/burger-squeeze'

const Navbar = ({
    textColor = "text-black",
    activeTextColor = "text-white",
    borders = false,
    start = false,
}) => {
    const [clicked, setclicked] = useState(false);
    const [hovered, setHovered] = useState(false);

    const handleToggle = () => {
        if (!clicked) {
            setclicked(true);


        } else {


            setclicked(false);

        }
    };
    // Navbar ka scrool band karne ke liye
    // useEffect(() => {
    //     if (clicked) {
    //         document.body.style.overflow = "hidden";
    //     } else {
    //         document.body.style.overflow = "auto";
    //     }

    //     return () => {
    //         document.body.style.overflow = "auto";
    //     };
    // }, [clicked]);



    return (
        <>
            <div className={`fixed inset-0 z-10 overflow-hidden pointer-events-none`}>
                <div className={`absolute inset-0 z-30 transition-opacity duration-2000 ease-in-out ${clicked ? "opacity-100 delay-400" : "opacity-0"}`}>
                    <Topography
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

                <div className={`absolute left-1/2 top-1/2 z-10 h-[600vmax] w-[600vmax] rounded-full bg-[#282C20] overflow-hidden transition-transform ease-in-out duration-1500 ${clicked ? "-translate-x-1/2 -translate-y-3/4" : "-translate-x-1/2 -translate-y-[105%] delay-380"}`} />
            </div>

            <div className={`flex fixed justify-between items-center   z-99 ${start ? "w-[95%] mx-[2.5%] mt-3" : "mx-[2%] mt-1 w-[96%] "} transition-all duration-300`}>
                <div className="  transition-all delay-300 ease-in duration-200 ">
                    <motion.div initial="initial" whileHover="hovered" className={`font-jetbrains text-center flex justify-center items-center text-5xl flex-col scale-y-70 ${clicked ? activeTextColor : textColor} transition-all delay-300 ease-in duration-200 ${start ? "gap-0" : "gap-1"}`}>
                        <FlipText text="AMAN" className={`scale-x-128 scale-y-120   ${start ? "text-5xl" : "text-[42px]"} transition-all duration-600`} />
                        <FlipText text="SINGH" className={`font-datatype scale-x-125 scale-y-125 ${start ? "text-5xl" : "text-[42px] "} transition-all duration-600`} />
                    </motion.div>
                </div>



                <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className={`  ${start ? "w-16 h-16" : "w-15 h-15"} transition-all duration-300 `}>

                    <div className={`group/card flex justify-center items-center relative left-4.25 top-px group overflow-hidden rounded-xl w-[98%] h-[97%] ${clicked ? "bg-[#F4F4ED]" : ""} cursor-pointer  transition-all ease-in-out duration-900 group `} onClick={handleToggle}>

                        <div className={`absolute  flex justify-center items-center group overflow-hidden cursor-pointer   transition-all ease-in border-4 m-0 rounded-xl   ${start ? "w-[60.572945999px] h-[60.4px]" : "w-[56px] h-[56px]"} ${hovered ? "border-[#D2FF00]" : ""}  ${clicked ? "-z-10" : "border-black  duration-600 z-10"}  fixed `} >
                            <div className={`cursor-pointer m-2 absolute  w-20 h-40 rounded-full ${hovered ? "translate-y-0" : "-translate-y-full"}   group-hover/card:translate-y-0 transition-all ease-in-out duration-900 delay-100 z-9 ${borders ? "opacity-0" : "opacity-100"} bg-[#D2FF00] group`} />

                            <div className={`m-1 absolute  w-20 h-40 rounded-full -translate-y-full  group-hover/card:translate-y-0 transition-all ease-in-out duration-900 delay-100 z-18 ${borders ? "opacity-100" : "opacity-0"} bg-[#D2FF00] group cursor-pointercursor-pointer`} />
                        </div>
                        <div className={`cursor-pointer m-2 absolute  w-20 h-40 rounded-full ${hovered ? "translate-y-0" : "-translate-y-full"}  ${clicked ? "opacity-100 " : "opacity-0 duration-0 delay-0"} group-hover/card:translate-y-0 transition-all ease-in-out duration-900 delay-100 z-9 $ bg-[#D2FF00] group`} />
                        <div className={`m-1 absolute  w-20 h-40 rounded-full -translate-y-full  group-hover/card:translate-y-0 transition-all ease-in-out duration-900 delay-100 z-18 ${borders ? "opacity-100" : "opacity-0"} bg-[#D2FF00] group cursor-pointercursor-pointer`} />


                        <div className={`absolute  w-30 h-40 rounded-full  ${borders ? "translate-y-0" : "-translate-y-full"}  transition-all ease-in-out duration-1800  bg-[#f5f5f5] z-15 group cursor-pointer `} />

                        <div className={`z-20 group cursor-pointer `}>
                            <Burger isOpen={clicked} className={`my-burger fixed ${clicked ? "scale-130" : ""}`} style={{
                                fontSize: start ? "11px" : "10px",
                                transition: "font-size 300ms",
                            }} />
                        </div>
                    </div>
                </div>


            </div>
        </>
    );
};

export default Navbar;