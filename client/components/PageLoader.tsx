import { ShieldCheck } from "lucide-react";

export default function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-secondary"
    >
      {/* Logo mark */}
      <div className="relative flex items-center justify-center">
       
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary shadow-lg">
          <ShieldCheck className="size-6 text-white" />
        </div>
      </div>

      {/* Spinner ring */}
      <svg
        className="size-6 animate-spin text-brand-secondary"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>

      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase select-none">
        SubSecure
      </p>
    </div>
  );
}
