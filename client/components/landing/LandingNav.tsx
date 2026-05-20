"use client";

import Link from "next/link";
import { Shield } from "lucide-react";

const NAV_LINKS = [
  { label: "Security", href: "#security" },
  { label: "Platform", href: "#platform" },
  { label: "Mission",  href: "#mission"  },
] as const;

export default function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/6 bg-[#06090f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[14px] font-semibold tracking-tight">SubSecure</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-[13px] text-white/40">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="hover:text-white/80 transition-colors">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-[13px] text-white/40 hover:text-white/80 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-[13px] font-medium border border-white/15 hover:border-white/30 text-white/70 hover:text-white px-3.5 py-1.5 rounded-lg transition-all"
          >
            Get started →
          </Link>
        </div>
      </div>
    </header>
  );
}
