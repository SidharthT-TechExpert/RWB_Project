'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { Building2, Save, Store, Phone, Mail, MapPin } from 'lucide-react';
import { useBranches } from '@/hooks/useBranches';
import toast from 'react-hot-toast';

export default function ManagerSettingsPage() {
  const { selectedBranch } = useBranches();

  const [form, setForm] = useState({
    name: selectedBranch?.name || 'Downtown Branch',
    code: selectedBranch?.code || 'BR-NY-01',
    phone: selectedBranch?.phone || '+1 212-555-0199',
    email: selectedBranch?.email || 'downtown@paragon.com',
    street: selectedBranch?.address?.street || '45 Park Avenue',
    city: selectedBranch?.address?.city || 'New York',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Outlet settings updated successfully!');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Outlet Settings & Configuration" />

      <main className="p-6 space-y-6 max-w-[1000px] w-full mx-auto pb-16">
        <div className="p-6 rounded-2xl bg-[#060C1E] border border-white/8 space-y-6 shadow-xl">
          <div className="border-b border-white/8 pb-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" /> Branch Outlet Parameters
            </h2>
            <p className="text-xs text-slate-400 mt-1">Configure contact details, address, and operating parameters for this branch.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300">Branch Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Branch Code</label>
                <input
                  disabled
                  value={form.code}
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/2 text-slate-400 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">Phone Number</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Street Address</label>
                <input
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full mt-1 px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/8">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-5 shadow-lg shadow-blue-600/30">
                <Save className="w-4 h-4" />
                <span>Save Parameters</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
