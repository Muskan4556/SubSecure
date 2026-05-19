"use client";

import { FEATURES } from "@/lib/data/landing";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function LandingPlatform() {
  return (
    <section id="platform" className="bg-white text-slate-900 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-12 sm:mb-16">
          <SectionLabel>03 — Platform</SectionLabel>
          <h2 className="text-[1.7rem] sm:text-[2.2rem] font-bold tracking-tight max-w-xl leading-tight mt-2">
            Six things. All of them necessary.
            <span className="text-slate-300"> None of them optional.</span>
          </h2>
        </Reveal>

        {/* features as a table list — NOT cards */}
        <div className="border-t border-slate-200">
          {FEATURES.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.04}>
              {/* mobile: icon + stacked | md+: 3-col table row */}
              <div className="flex md:grid md:grid-cols-[40px_200px_1fr] gap-4 md:gap-8 py-5 md:py-6 border-b border-slate-100 items-start group hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                  <f.icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 md:contents">
                  <div className="text-[14px] md:text-[15px] font-semibold text-slate-900 mb-1 md:mb-0 md:mt-0.5 leading-tight">
                    {f.name}
                  </div>
                  <div className="text-[13px] md:text-[14px] text-slate-500 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
