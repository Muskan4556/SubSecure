import { Shield } from "lucide-react";
import { COMPLIANCE_BADGES } from "@/lib/data/landing";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/6 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="flex items-center gap-2.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[13px] font-semibold">SubSecure</span>
          <span className="text-white/20 text-[11px] font-mono ml-4">
            Built for integrity · SDG 8
          </span>
        </div>

        <div className="flex flex-wrap gap-6 text-[11px] text-white/20 font-mono">
          {COMPLIANCE_BADGES.map((b) => (
            <span key={b} className="border border-white/8 px-2.5 py-1 rounded">
              {b}
            </span>
          ))}
        </div>

        <p className="text-[11px] font-mono text-white/15">
          © {new Date().getFullYear()} SubSecure
        </p>
      </div>
    </footer>
  );
}
