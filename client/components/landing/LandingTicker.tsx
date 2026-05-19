"use client";

import { TICKER_ITEMS } from "@/lib/data/landing";

export default function LandingTicker() {
  return (
    <div className="border-y border-white/7 overflow-hidden bg-[#080d18] py-3.5">
      <div className="flex animate-ticker whitespace-nowrap">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center shrink-0">
            {TICKER_ITEMS.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-4 mx-6 text-[11px] font-mono text-white/25 tracking-widest uppercase"
              >
                <span className="w-1 h-1 rounded-full bg-emerald-500/50 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
