"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-semibold text-white select-none shrink-0">
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
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <Link href="/dashboard">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary shrink-0">
                  <ShieldCheck className="size-4 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="text-sm font-semibold tracking-tight">
                    SubSecure
                  </span>
                  <p className="text-xs text-muted-foreground">
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, href, icon: Icon }) => {
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
                          <Icon />
                          <span>{label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
                    <span className="truncate text-sm font-medium">
                      {user.name}
                    </span>
                    {user.role === "ADMIN" && (
                      <span className="shrink-0 rounded-full bg-brand-secondary/10 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-brand-secondary">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
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
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <LogOut />
              <span>{isPending ? "Signing out…" : "Sign out"}</span>
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
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4 py-8">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-border" />
          <p className="text-sm text-muted-foreground">Dashboard</p>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
