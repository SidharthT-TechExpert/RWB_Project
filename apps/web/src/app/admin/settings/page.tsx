'use client';
import { Settings, Bell, Shield, Globe, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>

      {[
        {
          title: 'General', icon: Globe, items: [
            { label: 'Platform Name', value: 'QuickBite', type: 'text' },
            { label: 'Support Email', value: 'support@quickbite.app', type: 'email' },
            { label: 'Default Currency', value: 'INR', type: 'text' },
            { label: 'Default Timezone', value: 'Asia/Kolkata', type: 'text' },
          ],
        },
        {
          title: 'Notifications', icon: Bell, items: [
            { label: 'Admin Alert Email', value: 'admin@quickbite.app', type: 'email' },
          ],
        },
        {
          title: 'Security', icon: Shield, items: [
            { label: 'Session Timeout (minutes)', value: '15', type: 'number' },
            { label: 'Max Login Attempts', value: '5', type: 'number' },
          ],
        },
      ].map(({ title, icon: Icon, items }) => (
        <div key={title} className="rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" /> {title}
          </h2>
          {items.map(({ label, value, type }) => (
            <div key={label} className="flex items-center gap-4">
              <label className="w-48 text-sm text-muted-foreground shrink-0">{label}</label>
              <input
                type={type}
                defaultValue={value}
                className="flex-1 h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      ))}

      <Button>Save Settings</Button>
    </div>
  );
}
