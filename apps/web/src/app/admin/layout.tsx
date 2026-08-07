'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMeLoading } = useAuth();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isMeLoading) {
      if (!user) {
        router.replace('/admin/login');
      } else if (user.role === 'branch_manager') {
        router.replace('/manager');
      } else if (user.role === 'restaurant_owner' || user.role === 'owner') {
        router.replace('/dashboard');
      } else if (user.role !== 'admin') {
        router.replace('/admin/login');
      }
    }
  }, [isLoginPage, isMeLoading, user, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#050B18] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Left Navigation Sidebar */}
      <AdminSidebar />

      {/* Right Content Area with Top Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#050B18] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
