import Login from "@/components/Login";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-dvh flex items-center justify-center px-4 py-12 bg-[#06090f]"
    >
      {/* ledger grid lines — same as landing hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "100% 80px",
        }}
      />
      {/* top emerald glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <Login />
      </div>
    </div>
  );
}
