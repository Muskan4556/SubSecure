"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

export default function LandingHero() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen pt-14 flex flex-col overflow-hidden">
      {/* ledger grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "100% 80px",
          backgroundPositionY: "14px",
        }}
      />
      {/* asymmetric vertical accent line */}
      <div className="absolute top-14 bottom-0 left-[62%] w-px bg-white/4 pointer-events-none hidden lg:block" />

      <div className="relative flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 w-full pt-14 sm:pt-20 pb-0">
        {/* eyebrow label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-10 text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]"
        >
          <span className="w-8 h-px bg-white/20" />
          Subscription Security Platform — SDG 8
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(3rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.04em] mb-8 max-w-5xl"
        >
          Every subscription.<br />
          Every charge.<br />
          <span className="text-white/30">On record.</span>
        </motion.h1>

        {/* sub-copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8 mb-12 sm:mb-20"
        >
          <p className="text-[15px] text-white/40 leading-relaxed max-w-sm">
            Stop finding out about charges after they happen. SubSecure gives
            every recurring payment a permanent, audited home.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 text-[14px] font-medium text-white hover:text-emerald-300 transition-colors"
            >
              Track my subscriptions
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="text-[13px] text-white/25 hover:text-white/50 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </motion.div>

        {/* dashboard — floats out of hero, overlaps next section */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative -mx-4 sm:mx-0 -mb-1"
        >
          {/* fade bottom edge */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-linear-to-t from-[#06090f] to-transparent z-10 pointer-events-none" />
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}
