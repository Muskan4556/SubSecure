"use client";

import { MISSION_POINTS } from "@/lib/data/landing";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function LandingMission() {
  return (
    <section id="mission" className="py-20 sm:py-28 bg-[#06090f] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-12 sm:mb-16">
          <SectionLabel>04 — Mission / SDG 8</SectionLabel>
        </Reveal>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-20">
          <Reveal>
            <h2 className="text-[1.8rem] sm:text-[2.4rem] font-bold leading-[1.15] tracking-tight mb-6">
              Billing transparency is an economic justice issue.
            </h2>
            <p className="text-white/40 text-[15px] leading-relaxed mb-6">
              UN SDG 8 calls for inclusive economic growth and decent work.
              Opaque, predatory billing practices disproportionately affect
              individuals and small teams with the least capacity to audit
              their own finances.
            </p>
            <p className="text-white/40 text-[15px] leading-relaxed">
              SubSecure is a small but direct response: give people an audited,
              secure record of where their money goes, and the tools to act on it.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="flex flex-col gap-px border border-white/7 rounded-xl overflow-hidden">
              {MISSION_POINTS.map((p) => (
                <div
                  key={p.text}
                  className="flex items-start gap-4 bg-white/2 hover:bg-white/4 transition-colors px-5 py-4"
                >
                  <p.icon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-white/55 text-[14px] leading-snug">{p.text}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
