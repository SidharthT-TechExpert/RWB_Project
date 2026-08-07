'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isMeLoading } = useAuth();

  useEffect(() => {
    if (!isMeLoading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (user.role === 'branch_manager') {
        router.replace('/manager');
      } else if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.role !== 'restaurant_owner' && user.role !== 'owner') {
        router.replace('/auth/login');
      }
    }
  }, [isMeLoading, user, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#040609] text-slate-100 font-sans antialiased">
      {/* Sidebar — sticky, full height, never scrolls */}
      <DashboardSidebar />

      {/* Right panel — header sticky on top, content scrolls below */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky header across ALL dashboard pages */}
        <DashboardHeader />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#040609] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
