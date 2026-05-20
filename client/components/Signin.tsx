"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";

import { useLogin } from "@/apis/auth/auth-api";

const SigninSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SigninFormValues = z.infer<typeof SigninSchema>;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(SigninSchema),
  });

  const { mutateAsync: login } = useLogin();

  const onSubmit = async (data: SigninFormValues) => {
    try {
      await login(data);
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <motion.div
      className="w-full max-w-sm space-y-6"
      initial="hidden"
      animate="show"
      variants={stagger}
    >
      {/* Brand mark */}
      <motion.div variants={fadeUp} className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/90 flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-white/85">SubSecure</span>
      </motion.div>

      {/* Form panel */}
      <motion.div
        variants={fadeUp}
        className="bg-[#0d1525] border border-white/7 rounded-xl overflow-hidden"
      >
        {/* Panel header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/6">
          <h1 className="text-[1.35rem] font-bold tracking-tight text-white/90 leading-tight">
            Welcome back
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="px-6 py-5 space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 text-[14px] text-white/80 placeholder:text-white/20 font-sans outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all"
            />
            {errors.email && (
              <p className="text-[12px] text-red-400/80 font-mono">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-mono text-emerald-500/60 hover:text-emerald-400 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register("password")}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-white/80 placeholder:text-white/20 font-sans outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/20 hover:text-white/50 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[12px] text-red-400/80 font-mono">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50 text-white text-[14px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/6 flex items-center justify-center">
          <p className="text-[12px] font-mono text-white/25">
            No account?{" "}
            <Link href="/signup" className="text-white/50 hover:text-white/80 transition-colors">
              Sign up →
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Legal */}
      <motion.p variants={fadeUp} className="text-center text-[11px] font-mono text-white/20 px-2">
        By signing in you agree to our{" "}
        <Link href="/terms" className="text-white/35 hover:text-white/60 underline underline-offset-4 transition-colors">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="text-white/35 hover:text-white/60 underline underline-offset-4 transition-colors">
          Privacy
        </Link>
        .
      </motion.p>
    </motion.div>
  );
}
