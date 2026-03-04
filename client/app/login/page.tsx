import Login from "@/components/Login";

export default function LoginPage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-secondary">
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-brand-secondary opacity-[0.06] blur-3xl pointer-events-none" />
      </div>

      <div
        className="flex items-center justify-center px-4 sm:px-6 py-10 sm:py-12"
        style={{ minHeight: "100dvh" }}
      >
        <Login />
      </div>
    </>
  );
}
