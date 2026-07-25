import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'QuickBite — Reserve Tables & Pre-Order Food',
    template: '%s | QuickBite',
  },
  description:
    'Discover restaurants, reserve tables, pre-order food and skip the wait. The smartest way to dine out.',
  keywords: ['restaurant booking', 'table reservation', 'food pre-order', 'dining', 'QuickBite'],
  authors: [{ name: 'QuickBite' }],
  creator: 'QuickBite',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://quickbite.app',
    siteName: 'QuickBite',
    title: 'QuickBite — Reserve Tables & Pre-Order Food',
    description: 'Discover restaurants, reserve tables, pre-order food and skip the wait.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QuickBite' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickBite',
    description: 'Reserve Tables & Pre-Order Food',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${jakarta.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            {children}
            <AuthModal />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { borderRadius: '12px', fontSize: '14px' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
