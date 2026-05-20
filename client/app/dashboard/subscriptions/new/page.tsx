"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Info, CheckCircle2 } from "lucide-react";
import { useCreateSubscription } from "@/apis/subscriptions/subscriptions-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  category: z.string().trim().max(50).optional(),
  amount: z
    .number({ message: "Enter a valid amount" })
    .positive("Must be positive"),
  billingCycle: z.enum(["MONTHLY", "YEARLY"]),
  startDate: z
    .string()
    .min(1, "Start date is required")
    .refine(
      (d) => new Date(d) <= new Date(),
      "Start date cannot be in the future",
    ),
});

type FormValues = z.infer<typeof schema>;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[11px] font-mono text-white/40 uppercase tracking-[0.12em]">
          {label}
        </label>
        {hint && (
          <span className="text-[11px] font-mono text-white/20">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[11px] font-mono text-red-400/70">{error}</p>
      )}
    </div>
  );
}

const HOW_IT_WORKS = [
  "Enter the date you first paid — not today.",
  "We backfill every billing cycle from that date to now as Paid.",
  "The correct next renewal date is computed automatically.",
  "You get a complete billing history from day one.",
];

export default function NewSubscriptionPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateSubscription();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { billingCycle: "MONTHLY" },
  });

  function onSubmit(values: FormValues) {
    create(
      {
        ...values,
        startDate: new Date(values.startDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success(`Subscription added`);
          router.push("/dashboard/subscriptions");
        },
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
          toast.error(msg ?? "Failed to create subscription");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
          Subscriptions
        </p>
        <h1 className="text-[1.1rem] sm:text-[1.25rem] font-bold tracking-tight text-white/90">
          Add subscription
        </h1>
      </div>

      {/* 2-col on lg+, stacked below */}
      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-10 lg:items-start space-y-6 lg:space-y-0">
        {/* Left — form */}
        <div className="space-y-5">
          {/* Info note */}
          <div className="flex items-start gap-2.5 bg-blue-500/8 border border-blue-500/15 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-blue-400/70 shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-300/60 font-mono leading-relaxed">
              Enter the date you{" "}
              <strong className="text-blue-300/80">first paid</strong> for this
              subscription. We will backfill all past billing cycles
              automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Service name *" error={errors.name?.message}>
              <Input
                {...register("name")}
                placeholder="e.g. Netflix, Figma, GitHub"
                className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20"
              />
            </Field>

            <Field label="Category" error={errors.category?.message}>
              <Input
                {...register("category")}
                placeholder="e.g. Design, Dev Tools, Entertainment"
                className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (₹) *" error={errors.amount?.message}>
                <Input
                  {...register("amount", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="649"
                  className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20"
                />
              </Field>

              <Field
                label="Billing cycle *"
                error={errors.billingCycle?.message}
              >
                <select
                  {...register("billingCycle")}
                  className="h-9 w-full rounded-md border border-white/10 bg-white/4 px-3 py-1 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none scheme-dark"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </Field>
            </div>

            <Field
              label="Subscription start date *"
              hint="When did you first pay?"
              error={errors.startDate?.message}
            >
              <Input
                {...register("startDate")}
                type="date"
                max={today}
                className="bg-white/4 border-white/10 text-white/80 scheme-dark"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-white text-black hover:bg-white/90 font-semibold text-[13px]"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save subscription"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="text-white/40 hover:text-white/70 text-[13px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>

        {/* Right — help panel (desktop only) */}
        <div className="hidden lg:block space-y-4">
          <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/6">
              <p className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
                How it works
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-mono text-white/40 leading-relaxed">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/3 border border-white/8 rounded-xl px-5 py-4">
            <p className="text-[11px] font-mono text-white/25 uppercase tracking-wider mb-2">
              Example
            </p>
            <p className="text-[12px] font-mono text-white/35 leading-relaxed">
              Started Netflix on{" "}
              <span className="text-white/55">1 Jan 2024</span> at ₹649/mo — we
              create <span className="text-white/55">monthly Paid entries</span>{" "}
              from Jan 2024 to today and set the next renewal automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
