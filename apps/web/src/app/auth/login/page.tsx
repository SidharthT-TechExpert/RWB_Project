'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/store/authModalStore';

export default function LoginPage() {
  const router = useRouter();
  const openModal = useAuthModalStore((s) => s.openModal);

  useEffect(() => {
    router.replace('/');
    openModal();
  }, [router, openModal]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="animate-spin w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
    </div>
  );
}
