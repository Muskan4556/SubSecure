"use client";

import { PROBLEM_STATS } from "@/lib/data/landing";
import Reveal from "./Reveal";
import SectionLabel from "./SectionLabel";

export default function LandingProblem() {
  return (
    <section className="bg-white text-slate-900 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal className="mb-12 sm:mb-16">
          <SectionLabel>01 — The Problem</SectionLabel>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start">
          <Reveal>
            <p className="text-[1.8rem] sm:text-[2.4rem] font-bold leading-[1.15] tracking-tight text-slate-900 max-w-lg">
              Most people are paying for things they forgot they signed up for.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="pt-2">
            <p className="text-slate-500 text-[16px] leading-relaxed mb-8">
              Recurring billing is designed to be invisible. Charges happen
              automatically, often buried in a bank statement, often for services
              no longer used. At the individual level it&apos;s waste. At the
              organizational level it&apos;s a compliance and security risk.
            </p>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              SubSecure makes the invisible visible — a secure, audited ledger
              of every recurring payment, with full control over when and how
              they end.
            </p>
          </Reveal>
        </div>

        {/* large typographic stat numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 mt-16 sm:mt-20 border-t border-slate-200 pt-10 sm:pt-12 gap-8 sm:gap-0">
          {PROBLEM_STATS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 0.08}
              className="sm:px-8 sm:first:pl-0 sm:border-r sm:border-slate-200 sm:last:border-0 border-b border-slate-100 sm:border-b-0 pb-8 sm:pb-0 last:border-b-0 last:pb-0"
            >
              <div className="text-[3rem] sm:text-[3.6rem] font-bold tracking-tight text-slate-900 leading-none mb-3">
                {s.n}
              </div>
              <div className="text-slate-400 text-[14px] leading-snug whitespace-pre-line">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
