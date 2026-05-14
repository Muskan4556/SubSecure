import { Shield } from "lucide-react";

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#06090f]"
    >
      {/* ledger lines — same as landing hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
        }}
      />

      {/* emerald glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* logo mark */}
      <div className="relative flex items-center justify-center">
        {/* outer spinning ring */}
        <svg
          className="absolute w-16 h-16 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <circle
            cx="32" cy="32" r="28"
            stroke="rgba(16,185,129,0.12)"
            strokeWidth="1.5"
          />
          <path
            d="M32 4 a28 28 0 0 1 28 28"
            stroke="rgba(16,185,129,0.6)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-500/90 flex items-center justify-center shadow-[0_0_24px_rgba(16,185,129,0.25)]">
          <Shield className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* label */}
      <div className="flex flex-col items-center gap-1.5 select-none">
        <p className="text-[11px] font-mono text-white/50 tracking-[0.2em] uppercase">
          SubSecure
        </p>
        <p className="text-[9px] font-mono text-white/20 tracking-wider">
          Verifying session…
        </p>
      </div>
    </div>
  );
}
