"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useLogout } from "@/apis/auth/auth-api";
import { NAV_GROUPS } from "@/lib/data/sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-violet-400 to-blue-500 text-[10px] font-semibold text-white select-none shrink-0">
      {initials}
    </div>
  );
}

function AppSidebarInner() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/dashboard">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/90 shrink-0">
                  <Shield className="size-3.5 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="text-[13px] font-semibold tracking-tight">
                    SubSecure
                  </span>
                  <p className="text-[10px] font-mono text-sidebar-foreground/40">
                    Subscription Management
                  </p>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav Groups */}
      <SidebarContent>
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            ({ roles }) => !roles || (user?.role && roles.includes(user.role)),
          );
          if (!visibleItems.length) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[9px] font-mono uppercase tracking-[0.15em] text-sidebar-foreground/30">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map(({ label, href, icon: Icon }) => {
                    const isActive =
                      href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(href);

                    return (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={label}
                        >
                          <Link href={href}>
                            <Icon className="shrink-0" />
                            <span className="text-[12px]">{label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                className="cursor-default hover:bg-transparent"
              >
                <UserAvatar name={user.name} />
                <div className="flex-1 leading-tight overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-[12px] font-medium text-sidebar-foreground/80">
                      {user.name}
                    </span>
                    {user.role === "ADMIN" && (
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-1.5 py-px text-[8px] font-mono uppercase tracking-wide text-emerald-400">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="truncate text-[10px] font-mono text-sidebar-foreground/30">
                    {user.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarSeparator />

          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              disabled={isPending}
              onClick={() => logout()}
              className="text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/8 cursor-pointer transition-colors"
            >
              <LogOut className="shrink-0" />
              <span className="text-[12px]">
                {isPending ? "Signing out…" : "Sign out"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebarInner />

      <SidebarInset>
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4">
          <SidebarTrigger className="-ml-1 text-sidebar-foreground/40 hover:text-sidebar-foreground" />
          <div className="h-3.5 w-px bg-border" />
          <ChevronRight className="w-3 h-3 text-white/20" />
          <p className="text-[11px] font-mono text-white/30">Dashboard</p>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
