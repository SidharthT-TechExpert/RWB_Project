import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden">
      <DashboardSidebar />
      <main className="flex-1 p-3 xs:p-4 sm:p-6 lg:p-8 w-full max-w-full overflow-x-hidden">{children}</main>
    </div>
  );
}
