import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-100">
      {/* Sidebar — sticky, full height, never scrolls */}
      <DashboardSidebar />

      {/* Right panel — header sticky on top, content scrolls below */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky header across ALL dashboard pages */}
        <DashboardHeader />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
