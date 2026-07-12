'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Bell, Heart, CreditCard, Settings, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { getInitials, getErrorMessage } from '@/lib/utils';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => { const { data } = await api.get('/users/profile'); return data.data; },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => { await api.put('/users/profile', data); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['user', 'profile'] }); toast.success('Profile updated'); },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: profile ? { name: profile.name, phone: profile.phone || '', dietaryPreferences: profile.dietaryPreferences?.join(', ') } : undefined,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10 p-6 rounded-2xl border bg-card">
        <div className="w-20 h-20 rounded-full brand-gradient flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="avatar" /> : getInitials(user?.name || 'U')}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="brand" className="capitalize">{user?.role?.replace('_', ' ')}</Badge>
            {user?.isEmailVerified && <Badge variant="success">Verified</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Edit2 className="h-4 w-4" /> Edit Photo
        </Button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Tabs sidebar */}
        <div className="md:col-span-1 space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === id ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="md:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border p-6 bg-card"
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-5">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <Input label="Full Name" leftIcon={<User className="h-4 w-4" />} {...register('name', { required: 'Name is required' })} error={errors.name?.message} />
                <Input label="Phone" leftIcon={<Phone className="h-4 w-4" />} {...register('phone')} />
                <Input label="Email" defaultValue={user?.email} disabled leftIcon={<Mail className="h-4 w-4" />} hint="Contact support to change your email" />
                <Input label="Dietary Preferences" placeholder="e.g. vegetarian, gluten-free" {...register('dietaryPreferences')} hint="Comma-separated preferences" />
                <Button type="submit" isLoading={updateMutation.isPending}>Save Changes</Button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Saved Addresses</h2>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Address</Button>
                </div>
                {profile?.addresses?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No saved addresses yet</p>
                  </div>
                ) : (
                  (profile?.addresses || []).map((addr: { _id: string; label: string; street: string; city: string; state: string; zipCode: string; isDefault: boolean }) => (
                    <div key={addr._id} className="flex items-start justify-between p-4 rounded-xl border">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{addr.label}</p>
                          {addr.isDefault && <Badge variant="brand" className="text-xs py-0">Default</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                {[
                  { key: 'push', label: 'Push Notifications', desc: 'Booking updates and offers' },
                  { key: 'email', label: 'Email Notifications', desc: 'Confirmations and receipts' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Quick alerts via text' },
                  { key: 'promotions', label: 'Promotions', desc: 'Deals and special offers' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={profile?.notifications?.[key] !== false} onChange={(e) => updateMutation.mutate({ notifications: { ...profile?.notifications, [key]: e.target.checked } })} />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-brand-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold">Cuisine Preferences</h2>
                <div className="flex flex-wrap gap-2">
                  {['Indian', 'Chinese', 'Italian', 'Japanese', 'Mexican', 'Thai', 'American', 'Korean', 'Mediterranean', 'French'].map((c) => (
                    <button key={c}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${profile?.cuisinePreferences?.includes(c) ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <Button isLoading={updateMutation.isPending}>Save Preferences</Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
