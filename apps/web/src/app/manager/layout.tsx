'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ManagerSidebar } from '@/components/manager/ManagerSidebar';
import { useAuth } from '@/hooks/useAuth';

export default function ManagerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMeLoading } = useAuth();
  const isLoginPage = pathname === '/manager/login';

  useEffect(() => {
    if (!isLoginPage && !isMeLoading) {
      if (!user) {
        router.replace('/manager/login');
      }
    }
  }, [isLoginPage, isMeLoading, user, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#030816] text-slate-100 font-sans antialiased select-none">
      <ManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
