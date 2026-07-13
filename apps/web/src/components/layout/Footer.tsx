'use client';
import Link from 'next/link';
import { UtensilsCrossed, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  Discover: [
    { label: 'Restaurants', href: '/restaurants' },
    { label: 'Cuisines', href: '/search?type=cuisine' },
    { label: 'Popular Areas', href: '/search?type=area' },
    { label: 'New Openings', href: '/restaurants?sortBy=newest' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  'For Restaurants': [
    { label: 'Partner With Us', href: '/partner' },
    { label: 'Restaurant Login', href: '/dashboard' },
    { label: 'Marketing Tools', href: '/partner/marketing' },
    { label: 'Success Stories', href: '/partner/stories' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-8 h-8 brand-gradient rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span>Quick<span className="text-brand-500">Bite</span></span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Reserve tables, pre-order food and skip the wait. Dining made smarter.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Twitter, label: 'Twitter', href: '#' },
                { Icon: Instagram, label: 'Instagram', href: '#' },
                { Icon: Facebook, label: 'Facebook', href: '#' },
                { Icon: Mail, label: 'Email', href: 'mailto:hello@quickbite.app' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} QuickBite. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
