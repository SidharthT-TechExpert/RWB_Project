'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#050B18] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Navigation Sidebar */}
      <AdminSidebar />

      {/* Right Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-[#050B18]">
          {children}
        </main>
      </div>
    </div>
  );
}
