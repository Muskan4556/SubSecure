import { Shield } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/6 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
        <div className="flex items-center gap-2.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[14px] font-semibold">SubSecure</span>
        </div>

        <p className="text-[12px] font-mono text-white/15">
          © {new Date().getFullYear()} SubSecure
        </p>
      </div>
    </footer>
  );
}
