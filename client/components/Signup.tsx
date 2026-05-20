"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Shield, Check, X } from "lucide-react";
import { toast } from "sonner";

import { useSignup } from "@/apis/auth/auth-api";

const SignupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "At least 3 characters")
      .max(50, "At most 50 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(100, "Password is too long")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required")
      .regex(/[^A-Za-z0-9]/, "One special character required"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof SignupSchema>;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const RULES = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

// Isolated in its own component so the React Compiler can skip only this piece
// when it encounters the react-hook-form `useWatch` API.
function PasswordStrength({
  control,
  visible,
}: {
  control: Control<SignupFormValues>;
  visible: boolean;
}) {
  const value = useWatch({ control, name: "password" }) ?? "";
  if (!visible && value.length === 0) return null;

  const passed = RULES.filter((r) => r.test(value)).length;

  return (
    <div className="space-y-2 pt-1">
      <div className="flex gap-1">
        {RULES.map((_, i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
              i < passed
                ? passed <= 1
                  ? "bg-red-500/70"
                  : passed <= 2
                    ? "bg-amber-400/70"
                    : passed <= 3
                      ? "bg-yellow-400/70"
                      : "bg-emerald-500/80"
                : "bg-white/8"
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {RULES.map((r) => {
          const ok = r.test(value);
          return (
            <div key={r.label} className="flex items-center gap-1.5">
              {ok ? (
                <Check className="w-2.5 h-2.5 text-emerald-500/80 shrink-0" />
              ) : (
                <X className="w-2.5 h-2.5 text-white/15 shrink-0" />
              )}
              <span
                className={`text-[11px] font-mono ${ok ? "text-white/40" : "text-white/20"}`}
              >
                {r.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(SignupSchema) });

  const { mutateAsync: signup } = useSignup();

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Account created — welcome to SubSecure");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? "Something went wrong. Please try again.");
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
        <span className="text-[14px] font-semibold tracking-tight text-white/85">
          SubSecure
        </span>
      </motion.div>

      {/* Form panel */}
      <motion.div
        variants={fadeUp}
        className="bg-[#0d1525] border border-white/7 rounded-xl overflow-hidden"
      >
        {/* Panel header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/6">
          <h1 className="text-[1.35rem] font-bold tracking-tight text-white/90 leading-tight">
            Create account
          </h1>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-5 space-y-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              aria-invalid={!!errors.name}
              {...register("name")}
              className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 text-[14px] text-white/80 placeholder:text-white/20 font-sans outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all"
            />
            {errors.name && (
              <p className="text-[12px] text-red-400/80 font-mono">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35"
            >
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
              <p className="text-[12px] text-red-400/80 font-mono">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                {...register("password")}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-white/80 placeholder:text-white/20 font-sans outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/20 hover:text-white/50 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Strength bar */}
            <PasswordStrength control={control} visible={passwordFocused} />

            {errors.password && !passwordFocused && (
              <p className="text-[12px] text-red-400/80 font-mono">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-[11px] font-mono uppercase tracking-[0.14em] text-white/35"
            >
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
                className="w-full bg-white/5 border border-white/8 rounded-lg px-3.5 py-2.5 pr-10 text-[14px] text-white/80 placeholder:text-white/20 font-sans outline-none focus:border-emerald-500/40 focus:bg-white/7 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-white/20 hover:text-white/50 transition-colors"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[12px] text-red-400/80 font-mono">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50 text-white text-[14px] font-semibold py-2.5 rounded-lg transition-colors cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating account…
              </>
            ) : (
              <>
                Create account <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/6 flex items-center justify-center">
          <p className="text-[12px] font-mono text-white/25">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white/50 hover:text-white/80 transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Legal */}
      <motion.p
        variants={fadeUp}
        className="text-center text-[11px] font-mono text-white/20 px-2"
      >
        By creating an account you agree to our{" "}
        <Link
          href="/terms"
          className="text-white/35 hover:text-white/60 underline underline-offset-4 transition-colors"
        >
          Terms
        </Link>{" "}
        &{" "}
        <Link
          href="/privacy"
          className="text-white/35 hover:text-white/60 underline underline-offset-4 transition-colors"
        >
          Privacy
        </Link>
        .
      </motion.p>
    </motion.div>
  );
}
