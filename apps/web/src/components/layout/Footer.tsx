'use client';
import Link from 'next/link';
import { UtensilsCrossed, Twitter, Instagram, Facebook, Mail, ArrowRight, MapPin } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us',  href: '/about'   },
    { label: 'Careers',   href: '/careers'  },
    { label: 'Press',     href: '/press'    },
    { label: 'Blog',      href: '/blog'     },
  ],
  Discover: [
    { label: 'Restaurants',    href: '/restaurants'              },
    { label: 'Cuisines',       href: '/search?type=cuisine'      },
    { label: 'Popular Areas',  href: '/search?type=area'         },
    { label: 'New Openings',   href: '/restaurants?sortBy=newest'},
  ],
  Support: [
    { label: 'Help Center',    href: '/help'    },
    { label: 'Contact Us',     href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  'For Restaurants': [
    { label: 'Partner With Us',   href: '/partner'           },
    { label: 'Restaurant Login',  href: '/dashboard'         },
    { label: 'Marketing Tools',   href: '/partner/marketing' },
    { label: 'Success Stories',   href: '/partner/stories'   },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/30 dark:bg-zinc-950/80 border-t border-border mt-auto">
      {/* ── Newsletter Banner ── */}
      <div className="bg-brand-500/8 dark:bg-brand-500/10 border-b border-border">
        <div className="max-w-7xl 3xl:max-w-[100rem] mx-auto px-4 xs:px-5 sm:px-6 lg:px-8 xl:px-10 3xl:px-20 py-5 xs:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-500/15 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-black text-foreground truncate sm:whitespace-normal">Get dining deals straight to your inbox</p>
                <p className="text-xs text-muted-foreground font-medium hidden sm:block">Weekly curated restaurant picks. No spam.</p>
              </div>
            </div>
            <form className="flex w-full sm:w-auto gap-2 shrink-0" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 md:w-72 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-border bg-background text-sm font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ── */}
      <div className="
        max-w-7xl 3xl:max-w-[100rem] 4xl:max-w-[130rem] mx-auto
        px-4 xs:px-5 sm:px-6 lg:px-8 xl:px-10 3xl:px-20
        pt-10 xs:pt-12 sm:pt-14 lg:pt-16 3xl:pt-20
        pb-8 xs:pb-10 sm:pb-12
      ">
        {/*
          Grid layout:
          mobile  : 2-col links, brand full-width below
          sm      : 2-col left + 2-col right
          lg      : brand (1 col) + 4 link columns
        */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 xs:gap-10 3xl:gap-14">

          {/* Brand + social — full width on mobile, 1 col on lg */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl 3xl:text-2xl w-fit">
              <div className="w-9 h-9 3xl:w-10 3xl:h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
                <UtensilsCrossed className="w-4.5 h-4.5 3xl:w-5 3xl:h-5 text-white" />
              </div>
              <span className="text-foreground">Quick<span className="text-brand-500">Bite</span></span>
            </Link>

            <p className="text-sm 3xl:text-base text-muted-foreground leading-relaxed max-w-xs">
              Reserve tables, pre-order food and skip the wait. Dining made smarter — since 2024.
            </p>

            {/* City badge */}
            <div className="flex items-center gap-2 bg-brand-500/8 dark:bg-brand-500/12 border border-brand-500/15 rounded-full px-3 py-1.5 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_6px_#FF6B35]" />
              <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Live in New York</span>
            </div>

            {/* Social links */}
            <div className="flex gap-2.5">
              {[
                { Icon: Twitter,   label: 'Twitter',   href: '#',                           color: 'hover:bg-sky-500/10 hover:text-sky-500 hover:border-sky-500/20'     },
                { Icon: Instagram, label: 'Instagram', href: '#',                           color: 'hover:bg-pink-500/10 hover:text-pink-500 hover:border-pink-500/20'   },
                { Icon: Facebook,  label: 'Facebook',  href: '#',                           color: 'hover:bg-blue-600/10 hover:text-blue-600 hover:border-blue-600/20'   },
                { Icon: Mail,      label: 'Email',     href: 'mailto:hello@quickbite.app', color: 'hover:bg-brand-500/10 hover:text-brand-500 hover:border-brand-500/20' },
              ].map(({ Icon, label, href, color }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={`w-9 h-9 3xl:w-10 3xl:h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground transition-all duration-200 ${color}`}
                >
                  <Icon className="h-4 w-4 3xl:h-4.5 3xl:w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-3 3xl:gap-4">
              <h3 className="font-black text-xs 3xl:text-sm uppercase tracking-widest text-foreground/80">{title}</h3>
              <ul className="space-y-2 3xl:space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm 3xl:text-base text-muted-foreground hover:text-foreground hover:translate-x-0.5 transition-all duration-150 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-10 xs:mt-12 pt-6 xs:pt-8 border-t border-border flex flex-col xs:flex-row justify-between items-center gap-3 xs:gap-4">
          <div className="flex items-center gap-2 text-xs 3xl:text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
            <span>All systems operational</span>
            <span className="text-muted-foreground/40">·</span>
            <span>© {new Date().getFullYear()} QuickBite, Inc.</span>
          </div>
          <div className="flex items-center gap-4 xs:gap-5 text-xs 3xl:text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms"   className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
