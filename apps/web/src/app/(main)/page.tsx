'use client';
export const dynamic = 'force-dynamic';

import { useAuthStore } from '@/store/authStore';
import LandingPage from '@/components/home/LandingPage';
import UserHomePage from '@/components/home/UserHomePage';

/**
 * QuickBite Home Page
 * ─────────────────────────────────────────────
 * • Non-logged in guest → Public marketing LandingPage
 * • Logged-in user     → Personalised UserHomePage dashboard
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <UserHomePage user={user} />;
  }

  return <LandingPage />;
}
