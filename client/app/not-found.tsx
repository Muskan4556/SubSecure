"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, ArrowUpRight } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const variants = {
  container: {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  },
  item: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#06090f] relative overflow-hidden flex flex-col">
      {/* ledger lines */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
          backgroundPositionY: "14px",
        }}
      />

      {/* asymmetric vertical accent */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-[58%] w-px bg-white/4 pointer-events-none" />

      {/* ambient red glow */}
      <div className="pointer-events-none absolute top-[20%] left-[25%] w-[700px] h-[400px] rounded-full bg-red-500/3 blur-3xl" />

      {/* ghost 404 background */}
      <div
        className="pointer-events-none select-none absolute right-[-5%] top-1/2 -translate-y-1/2 text-[clamp(14rem,32vw,24rem)] font-black leading-none tracking-[-0.05em] text-white/2.5 hidden lg:block"
        aria-hidden
      >
        404
      </div>

      {/* ── Top bar ── */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 h-14 border-b border-white/6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500/90 flex items-center justify-center">
            <Shield className="w-3 h-3 text-white" />
          </div>
          <span className="text-[13px] font-semibold tracking-tight text-white/70">
            SubSecure
          </span>
        </Link>
      </header>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <motion.div
          className="w-full max-w-7xl mx-auto px-6 sm:px-10 py-16"
          initial="hidden"
          animate="show"
          variants={variants.container}
        >
          {/* incident badge */}
          <motion.div
            variants={variants.item}
            className="flex items-center gap-2.5 mb-10"
          >
            <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400/80 text-[11px] font-mono uppercase tracking-[0.18em] px-3 py-1.5 rounded-full">
              System Notice — Route Not Found
            </span>
          </motion.div>

          {/* 404 — visible on mobile only */}
          <motion.div
            variants={variants.item}
            className="text-[5rem] font-black leading-none tracking-[-0.04em] text-white/5 select-none mb-3 lg:hidden"
            aria-hidden
          >
            404
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={variants.item}
            className="text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[1.04] tracking-[-0.035em] text-white/90 mb-5 max-w-2xl"
          >
            Page not
            <br />
            <span className="text-white/25">on record.</span>
          </motion.h1>

          <motion.p
            variants={variants.item}
            className="text-[15px] text-white/35 leading-relaxed max-w-md mb-10"
          >
            The path you requested isn&apos;t registered in this system. It may
            have been moved, deleted, or never existed.
          </motion.p>

          {/* actions */}
          <motion.div
            variants={variants.item}
            className="flex flex-wrap items-center gap-3 mb-14"
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-[13px] font-medium text-white/50 hover:text-white/85 border border-white/10 hover:border-white/25 px-5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Go back
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-white border border-white/15 hover:border-white/35 hover:bg-white/4 px-5 py-2.5 rounded-xl transition-all"
            >
              Dashboard
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
