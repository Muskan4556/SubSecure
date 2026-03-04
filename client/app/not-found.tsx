"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "@/lib/animations";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-6 relative overflow-hidden">
      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand-primary) 1px, transparent 1px), linear-gradient(90deg, var(--brand-primary) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-brand-secondary opacity-[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-64 w-64 rounded-full bg-brand-tertiary opacity-[0.05] blur-3xl" />

      <motion.div
        className="relative z-10 flex flex-col items-center text-center max-w-md"
        initial="hidden"
        animate="show"
        variants={stagger(0.1)}
      >
        {/* Logo */}
        <motion.div variants={fadeUp}>
          <Link href="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary">
              <ShieldCheck className="size-4 text-brand-primary-fg" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-brand-primary">
              SubSecure
            </span>
          </Link>
        </motion.div>

        {/* 404 number */}
        <motion.div variants={fadeUp} className="relative mb-6 select-none">
          <span className="text-[10rem] font-black leading-none tracking-tighter text-border">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[10rem] font-black leading-none tracking-tighter text-brand-secondary mask-[linear-gradient(to_bottom,black_50%,transparent_100%)]">
            404
          </span>
        </motion.div>

        {/* Text */}
        <motion.h1
          variants={fadeUp}
          className="text-2xl font-bold tracking-tight text-brand-primary mb-3"
        >
          Page not found
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="text-sm text-muted-foreground leading-relaxed mb-8"
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Check the URL or head back to the dashboard.
        </motion.p>

        {/* Actions */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 hover:text-brand-primary-fg cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            Go back
          </Button>
          <Button
            className="gap-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-primary-fg border-0"
            asChild
          >
            <Link href="/">
              <Home className="size-4" />
              Home
            </Link>
          </Button>
        </motion.div>

        <motion.p variants={fadeUp} className="mt-10 text-xs text-muted-foreground">
          Need help?{" "}
          <Link
            href="/contact"
            className="text-brand-secondary hover:underline underline-offset-4 transition-colors"
          >
            Contact support
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
