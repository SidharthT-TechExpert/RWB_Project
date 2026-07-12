'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor, Bell, Shield, Globe, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const THEMES = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Appearance */}
      <section className="space-y-4">
        <h2 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <Monitor className="h-4 w-4" /> Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all',
                theme === value ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-border hover:border-brand-200'
              )}
            >
              <Icon className={cn('h-6 w-6', theme === value ? 'text-brand-500' : 'text-muted-foreground')} />
              <span className={cn('text-sm font-medium', theme === value ? 'text-brand-600 dark:text-brand-400' : 'text-muted-foreground')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Links */}
      <section className="space-y-2">
        <h2 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
          <Globe className="h-4 w-4" /> App
        </h2>
        {[
          { label: 'Notification Preferences', href: '/profile#notifications', icon: Bell },
          { label: 'Privacy & Security', href: '/profile#security', icon: Shield },
          { label: 'Language', value: 'English', icon: Globe },
        ].map(({ label, href, icon: Icon, value }) => (
          <div key={label} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            {value && <span className="text-sm text-muted-foreground">{value}</span>}
          </div>
        ))}
      </section>

      {/* About */}
      <section className="space-y-2">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">About</h2>
        {[
          { label: 'Version', value: '1.0.0' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
        ].map(({ label, value, href }) => (
          <div key={label} className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <span className="text-sm font-medium">{label}</span>
            {value && <span className="text-sm text-muted-foreground">{value}</span>}
          </div>
        ))}
      </section>

      {/* Sign out */}
      <Button
        variant="outline"
        className="w-full gap-2 border-destructive text-destructive hover:bg-destructive/10"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
}
