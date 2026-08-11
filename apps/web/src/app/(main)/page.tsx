'use client';

import { useAuthStore } from '@/store/authStore';
import LandingPage from '@/components/home/LandingPage';
import UserHomePage from '@/components/home/UserHomePage';

/**
 * QuickBite Home Page
 * ─────────────────────────────────────────────
 * • Not logged-in  → public marketing landing page
 * • Logged-in user → personalised user home dashboard
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <UserHomePage user={user} />;
  }

  return <LandingPage />;
}
