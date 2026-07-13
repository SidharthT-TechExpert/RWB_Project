'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft, UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-brand-50 via-white to-orange-50 dark:from-brand-950 dark:via-background dark:to-background">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/25 animate-pulse">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="text-8xl font-black text-brand-500 opacity-20 select-none">404</div>

        <div>
          <h1 className="text-3xl font-bold mb-3">Page not found</h1>
          <p className="text-muted-foreground">
            Looks like this page went off the menu. Let&apos;s get you back to something delicious.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
