import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { EditSubscriptionValues } from "@/lib/validations/subscriptionValidation";

export function SubscriptionEditForm({
  register,
  onSubmit,
}: {
  register: UseFormRegister<EditSubscriptionValues>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <form
      id="edit-form"
      onSubmit={onSubmit}
      className="px-5 py-4 grid grid-cols-2 gap-4"
    >
      <div className="space-y-1 col-span-2">
        <label className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Name
        </label>
        <Input
          {...register("name")}
          className="bg-white/4 border-white/10 text-white/80"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Category
        </label>
        <Input
          {...register("category")}
          className="bg-white/4 border-white/10 text-white/80"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Amount (₹)
        </label>
        <Input
          {...register("amount", { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="bg-white/4 border-white/10 text-white/80"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Billing cycle
        </label>
        <select
          {...register("billingCycle")}
          className="h-9 w-full rounded-md border border-white/10 bg-white/4 px-3 py-1 text-sm text-white/80 focus:outline-none scheme-dark"
        >
          <option value="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-mono text-white/30 uppercase tracking-wider">
          Renewal date
        </label>
        <Input
          {...register("renewalDate")}
          type="date"
          className="bg-white/4 border-white/10 text-white/80 scheme-dark"
        />
      </div>
    </form>
  );
}
