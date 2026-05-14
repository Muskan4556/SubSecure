import AppSidebar from "@/components/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark">
      <AppSidebar>{children}</AppSidebar>
    </div>
  );
}
