"use client";

import RevealText from "@/components/Reveal";

export default function IntroSection() {
  return (
    <section className="relative min-h-screen z-9 overflow-hidden">
      <div className="flex h-[105vh] items-center justify-center flex-col pt-4 scale-y-105 relative -top-2">

        <RevealText delay={0} className="px-7 z-1">
          <div className="font-datatype scale-x-105 font-bold text-8xl text-[#DDE1D2] scale-y-110 tracking-tight relative pb-1 top-2">
            BUILDING SCALABLE
          </div>
        </RevealText>

        <RevealText className="z-1">
          <div className="flex font-datatype font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 justify-center items-center gap-3">
            <div className="font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-131">
              SOFTWARE,
            </div>
            <div className="scale-x-105 felx pt-0.5 w-125 relative right- tracking-tight">
              CRAFTING
            </div>
          </div>
        </RevealText>

        <RevealText className="w-fit">
          <div className="font-datatype font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex justify-center gap-4">
            <div className="scale-x-105 tracking-tight felx pt-0.5 w-108">
              MODERN
            </div>
            <div className="font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-166">
              EXPERIENCES,
            </div>
          </div>
        </RevealText>

        <RevealText className="px-5">
          <div className="font-datatype scale-x-105 tracking-tight font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex">
            AND TURNING
          </div>
        </RevealText>

        <RevealText>
          <div className="font-datatype font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex gap-4">
            <div className="font-medula scale-x-180 text-[#B2C73A] tracking-[3px] font-semibold scale-y-115 w-69">
              IDEAS
            </div>
            <div className="scale-x-105 tracking-tight felx pt-0.5 w-200">
              INTO PRODUCTS
            </div>
          </div>
        </RevealText>

        <RevealText className="px-6">
          <div className="font-datatype scale-x-105 tracking-tight font-bold text-8xl text-[#DDE1D2] text-center scale-y-110 flex">
            THAT SOLVE REAL
          </div>
        </RevealText>

        <RevealText className="px-30">
          <div className="font-bold text-8xl text-center font-medula scale-x-180 scale-y-127 text-[#B2C73A] tracking-[3px] flex">
            PROBLEMS.
          </div>
        </RevealText>

      </div>
    </section>
  );
}