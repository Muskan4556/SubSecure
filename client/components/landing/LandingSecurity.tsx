"use client";

import { SECURITY_TECHNIQUES, THREAT_MODEL } from "@/lib/data/landing";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function LandingSecurity() {
  return (
    <section id="security" className="py-20 sm:py-28 bg-[#06090f] border-t border-white/6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-12 sm:mb-16">
          <SectionLabel>02 — Security Architecture</SectionLabel>
        </Reveal>

        <div className="grid lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20 items-start">
          {/* left: headline + technique pills */}
          <Reveal>
            <h2 className="text-[1.7rem] sm:text-[2.2rem] font-bold leading-[1.2] tracking-tight mb-6">
              Built around the five ways systems actually get breached.
            </h2>
            <p className="text-white/40 text-[15px] leading-relaxed">
              Not bolt-on security. Structural security. Every endpoint, every
              data path, every role boundary was designed with a specific threat
              vector in mind.
            </p>

            <div className="mt-10 flex flex-col gap-2">
              {SECURITY_TECHNIQUES.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center gap-2.5 text-[12px] font-mono text-white/35"
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                  {t.label}
                </div>
              ))}
            </div>
          </Reveal>

          {/* right: threat model as numbered rows */}
          <Reveal delay={0.1}>
            {THREAT_MODEL.map((r, i) => (
              <div
                key={r.n}
                className={`py-5 grid grid-cols-[32px_1fr] gap-5 ${
                  i > 0 ? "border-t border-white/7" : ""
                }`}
              >
                <span className="text-[11px] font-mono text-white/20 mt-0.5">{r.n}</span>
                <div>
                  <div className="text-[15px] font-semibold text-white/85 mb-1.5">
                    {r.threat}
                  </div>
                  <div className="text-[13px] text-white/35 leading-relaxed">{r.fix}</div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
