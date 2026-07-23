'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Bell, Search, Menu, X, Sun, Moon,
  User, LogOut, ChevronDown, UtensilsCrossed,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModalStore } from '@/store/authModalStore';
import { cn, getInitials } from '@/lib/utils';

const navLinks = [
  { href: '#find-table',   label: 'Find a table'    },
  { href: '#how-it-works', label: 'How it works'    },
  { href: '#explore',      label: 'Explore options' },
  { href: '#partners',     label: 'For partners'    },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { openModal } = useAuthModalStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [menuOpen, setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);

  /* Close mobile menu on route change */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  /* Add shadow when scrolled */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        'bg-white/80 dark:bg-black/80 backdrop-blur-md',
        'border-b border-white/20 dark:border-zinc-800/50',
        scrolled && 'shadow-md shadow-black/5 dark:shadow-black/30',
      )}
    >
      {/* ─── Main nav bar ─── */}
      <nav className="
        w-full
        px-4 xs:px-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-14 3xl:px-20 4xl:px-28
        h-14 xs:h-16 3xl:h-20 4xl:h-24
        flex items-center justify-between gap-3
        max-w-[1920px] 4xl:max-w-[2400px] mx-auto
      ">
        {/* ── Logo ── */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg xs:text-xl 3xl:text-2xl 4xl:text-3xl shrink-0"
        >
          <div className="w-8 h-8 3xl:w-10 3xl:h-10 4xl:w-12 4xl:h-12 brand-gradient rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 3xl:w-5 3xl:h-5 4xl:w-6 4xl:h-6 text-white" />
          </div>
          <span className="text-foreground">Quick<span className="text-brand-500">Bite</span></span>
        </Link>

        {/* ── Desktop nav links (lg+) ── */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-2.5 xl:px-4 py-2 rounded-xl text-xs xl:text-sm 3xl:text-base 4xl:text-lg font-semibold transition-colors whitespace-nowrap',
                pathname === link.href
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ── Right-side actions ── */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
          {/* Search — hidden on small mobile, shown sm+ */}
          <Link href="/search" className="hidden sm:flex">
            <Button variant="ghost" size="icon" aria-label="Search"
              className="3xl:w-11 3xl:h-11 4xl:w-13 4xl:h-13">
              <Search className="h-5 w-5 3xl:h-6 3xl:w-6" />
            </Button>
          </Link>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="3xl:w-11 3xl:h-11 4xl:w-13 4xl:h-13"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun  className="h-5 w-5 3xl:h-6 3xl:w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 3xl:h-6 3xl:w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Notifications (authenticated) */}
          {isAuthenticated && (
            <Link href="/notifications" className="relative hidden xs:flex">
              <Button variant="ghost" size="icon" aria-label="Notifications"
                className="3xl:w-11 3xl:h-11">
                <Bell className="h-5 w-5 3xl:h-6 3xl:w-6" />
              </Button>
            </Link>
          )}

          {/* Cart (authenticated) */}
          {isAuthenticated && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart"
                className="3xl:w-11 3xl:h-11 4xl:w-13 4xl:h-13">
                <ShoppingCart className="h-5 w-5 3xl:h-6 3xl:w-6" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-5 w-5 3xl:h-6 3xl:w-6 rounded-full bg-brand-500 text-white text-xs 3xl:text-sm flex items-center justify-center font-bold"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </Button>
            </Link>
          )}

          {/* Auth — user dropdown (desktop) / Get Started CTA */}
          {isAuthenticated ? (
            <div className="relative hidden sm:block shrink-0">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted transition-colors 3xl:px-4 3xl:py-2.5"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 3xl:w-10 3xl:h-10 rounded-full brand-gradient flex items-center justify-center text-white text-sm font-bold">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user?.name || 'U')
                  )}
                </div>
                <span className="text-sm 3xl:text-base font-medium max-w-[100px] truncate">{user?.name}</span>
                <ChevronDown className={cn('h-4 w-4 3xl:h-5 3xl:w-5 text-muted-foreground transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 3xl:w-64 rounded-2xl border bg-card shadow-lg overflow-hidden z-50"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="p-3 border-b">
                      <p className="text-sm 3xl:text-base font-semibold">{user?.name}</p>
                      <p className="text-xs 3xl:text-sm text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      {[
                        { href: '/profile',  label: 'My Profile',  icon: User },
                        { href: '/bookings', label: 'My Bookings', icon: null },
                        { href: '/orders',   label: 'My Orders',   icon: null },
                        { href: '/wallet',   label: 'Wallet',      icon: null },
                      ].map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm 3xl:text-base hover:bg-muted transition-colors"
                        >
                          {label}
                        </Link>
                      ))}
                      {user?.role === 'restaurant_owner' && (
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm 3xl:text-base hover:bg-muted transition-colors">
                          Restaurant Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm 3xl:text-base hover:bg-muted transition-colors">
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="p-1 border-t">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm 3xl:text-base w-full text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4 3xl:h-5 3xl:w-5" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Get Started CTA ── */
            <div className="hidden xs:flex items-center shrink-0">
              <Button
                size="sm"
                className="relative overflow-hidden bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] hover:from-[#e85a25] hover:to-[#ff7a40] text-white font-bold rounded-2xl px-3.5 sm:px-5 lg:px-6 3xl:px-8 py-2 3xl:py-3 shadow-[0_4px_20px_rgba(255,107,53,0.4)] hover:shadow-[0_6px_28px_rgba(255,107,53,0.55)] transition-all duration-200 active:scale-[0.97] text-xs sm:text-[13px] 3xl:text-base tracking-wide whitespace-nowrap"
                onClick={openModal}
              >
                <span className="relative z-10">Get Started →</span>
              </Button>
            </div>
          )}

          {/* ── Hamburger (< lg) ── */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span key="close"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}>
                  <X className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span key="open"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}>
                  <Menu className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </nav>

      {/* ─── Mobile full-screen menu ─── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 pt-3 pb-6 pb-safe space-y-1.5">
              {/* Nav links */}
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Divider */}
              <div className="h-px bg-border mx-2 my-2" />

              {/* Search on mobile */}
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28, duration: 0.2 }}
              >
                <Link
                  href="/search"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-colors text-foreground"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Search restaurants
                </Link>
              </motion.div>

              {/* Auth section */}
              {!isAuthenticated ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.2 }}
                  className="pt-2"
                >
                  <Button
                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] hover:from-[#e85a25] hover:to-[#ff7a40] text-white font-bold rounded-2xl py-4 shadow-[0_4px_16px_rgba(255,107,53,0.35)] text-[15px] tracking-wide"
                    onClick={() => { openModal(); setMenuOpen(false); }}
                  >
                    Get Started →
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.2 }}
                  className="space-y-1"
                >
                  {[
                    { href: '/profile',  label: 'My Profile'  },
                    { href: '/bookings', label: 'My Bookings' },
                    { href: '/orders',   label: 'My Orders'   },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                      className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium hover:bg-muted transition-colors">
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-base w-full text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
