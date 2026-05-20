import Login from "@/components/Signin";

export default function LoginPage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center px-4 py-8 sm:py-12 bg-[#06090f]">
      {/* ledger grid lines with intersection dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "100% 80px, 80px 100%, 80px 80px",
        }}
      />
      {/* top emerald glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-[500px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm my-auto">
        <Login />
      </div>
    </div>
  );
}
