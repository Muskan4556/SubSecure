"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";

export default function LandingCTA() {
  return (
    <section className="border-t border-white/6 py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
            <div>
              <div className="text-[11px] font-mono text-white/25 uppercase tracking-widest mb-5">
                — Get started
              </div>
              <h2 className="text-[2rem] sm:text-[2.8rem] font-bold tracking-tight leading-[1.1] max-w-xl">
                Stop finding out about<br />
                charges <span className="text-white/25">after the fact.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-white border border-white/20 hover:border-white/40 hover:bg-white/5 px-7 py-3.5 rounded-xl transition-all"
              >
                Track my subscriptions <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="text-[12px] text-white/25 hover:text-white/50 text-center transition-colors"
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
