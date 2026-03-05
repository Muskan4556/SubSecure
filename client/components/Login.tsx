"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { DEMO_CREDENTIALS } from "@/lib/types/auth-types";
import { useLogin } from "@/apis/auth/auth-api";

// Validation

const SigninSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type SigninFormValues = z.infer<typeof SigninSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(SigninSchema),
  });

  const { mutateAsync: login } = useLogin();

  const fillDemo = () => {
    reset(DEMO_CREDENTIALS);
    toast.info("Demo credentials filled in");
  };

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
      className="w-full max-w-sm sm:max-w-md space-y-5 sm:space-y-6"
      initial="hidden"
      animate="show"
      variants={staggerContainer}
    >
      {/* Logo */}
      <motion.div variants={fadeUp} className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary">
          <ShieldCheck className="size-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">SubSecure</span>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card className="shadow-sm border rounded-xl sm:rounded-2xl bg-card">
          <CardHeader className="pb-4 sm:pb-5 px-5 sm:px-6 pt-5 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription>
              Sign in to your SubSecure workspace
            </CardDescription>
          </CardHeader>

          <CardContent className="px-5 sm:px-6">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@gmail.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-brand-secondary hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-10"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={fillDemo}
                className="w-full text-xs text-muted-foreground border border-dashed border-border rounded-lg py-2 px-3 hover:border-brand-secondary hover:text-brand-secondary transition-colors cursor-pointer "
              >
                Fill demo credentials
              </button>

              <Button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg border-0 cursor-pointer"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin size-4"
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
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t pt-4 px-5 sm:px-6 pb-5 sm:pb-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-foreground underline-offset-4 hover:underline transition-colors"
              >
                Request access
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className="text-center text-xs text-muted-foreground px-2 sm:px-4"
      >
        By signing in, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </motion.p>
    </motion.div>
  );
}

/*
Submit clicked
      ↓
handleSubmit()
      ↓
validate (Zod)
      ↓
if valid → onSubmit(data)
if invalid → populate errors
*/
