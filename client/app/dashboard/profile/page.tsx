"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useMe, useUpdateMe } from "@/apis/users/users-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useEffect } from "react";
import { formatDateLong } from "@/lib/utils/format";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});
type FormValues = z.infer<typeof schema>;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[12px] font-mono text-white/60">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser, setAuth, accessToken } = useAuth();
  const { data: meData, isLoading } = useMe();
  const { mutate: updateMe, isPending: updating } = useUpdateMe();

  const me = meData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (me) reset({ name: me.name });
  }, [me, reset]);

  function onSubmit(values: FormValues) {
    updateMe(values, {
      onSuccess: (data) => {
        toast.success("Profile updated");
        if (accessToken && authUser) {
          setAuth(accessToken, { ...authUser, name: data.data.name });
        }
        reset({ name: data.data.name });
      },
      onError: () => toast.error("Update failed"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
      </div>
    );
  }

  const initials = (me?.name ?? "?")
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 max-w-lg">
      {/* Header */}
      <div>
        <p className="text-[10px] font-mono text-white/25 uppercase tracking-[0.15em] mb-1">
          Account
        </p>
        <h1 className="text-[1.25rem] font-bold tracking-tight text-white/90">
          Profile
        </h1>
      </div>

      {/* Avatar + role */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-blue-500 text-[18px] font-bold text-white select-none shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-[14px] font-semibold text-white/80">{me?.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-white/30">
              {me?.email}
            </span>
            {me?.role === "ADMIN" && (
              <span className="text-[8px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-px rounded-full uppercase">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit name */}
      <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/6">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3 h-3" /> Edit profile
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
              Display name
            </label>
            <Input
              {...register("name")}
              className="bg-white/4 border-white/10 text-white/80 placeholder:text-white/20"
            />
            {errors.name && (
              <p className="text-[10px] font-mono text-red-400/70">
                {errors.name.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={updating || !isDirty}
            className="bg-white text-black hover:bg-white/90 font-semibold text-[12px] disabled:opacity-40"
          >
            {updating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/6">
          <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            Account details
          </p>
        </div>
        <div className="px-5">
          <InfoRow label="Email" value={me?.email ?? "—"} />
          <InfoRow label="Role" value={me?.role ?? "—"} />
          <InfoRow label="Status" value={me?.status ?? "—"} />
          <InfoRow
            label="Member since"
            value={
              me?.createdAt ? formatDateLong(me.createdAt) : "—"
            }
          />
        </div>
      </div>
    </div>
  );
}
