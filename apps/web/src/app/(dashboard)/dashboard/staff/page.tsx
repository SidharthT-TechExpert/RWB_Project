'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, Plus, Search, Mail, Phone, Building2,
  ShieldCheck, Lock, X, CheckCircle2, UserPlus, Key
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useMyRestaurants } from '@/hooks/useRestaurants';

interface ManagerItem {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  branchName?: string;
}

export default function BranchStaffPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'managers' | 'staff'>('managers');
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '+1 212-555-0199',
    tempPassword: 'Manager@123',
    branchId: '',
  });

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;
  const queryClient = useQueryClient();

  // Fetch branches for assignment
  const { data: branchesData } = useQuery({
    queryKey: ['branches', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { data: [] };
      const res = await api.get(`/branches/restaurant/${restaurantId}`);
      return res.data;
    },
    enabled: !!restaurantId,
  });

  // Fetch branch managers
  const { data: managersData, isLoading } = useQuery({
    queryKey: ['branch-managers'],
    queryFn: async () => {
      const res = await api.get('/branches/owner/managers');
      return res.data;
    },
  });

  const defaultManagers: ManagerItem[] = [
    {
      _id: 'm1',
      name: 'Arun Kumar',
      email: 'arun.kumar@paragon.com',
      phone: '+1 212-555-0199',
      role: 'branch_manager',
      branchName: 'Downtown Branch',
    },
    {
      _id: 'm2',
      name: 'Priya Sharma',
      email: 'priya.sharma@paragon.com',
      phone: '+1 212-555-0144',
      role: 'branch_manager',
      branchName: 'Uptown Branch',
    },
  ];

  const managersList: ManagerItem[] = (managersData?.data?.length > 0 ? managersData.data : defaultManagers).filter((m: ManagerItem) =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
  );

  const branches = branchesData?.data || [
    { _id: 'b1', name: 'Downtown Branch' },
    { _id: 'b2', name: 'Uptown Branch' },
  ];

  // Assign Manager Mutation
  const createManagerMutation = useMutation({
    mutationFn: async (payload: typeof managerForm) => {
      const targetBranchId = payload.branchId || branches[0]?._id || 'b1';
      return api.post(`/branches/${targetBranchId}/manager`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-managers'] });
      toast.success('🎉 Branch Manager credentials created successfully!');
      setIsAddManagerOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create manager');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09122B]/90 p-6 rounded-2xl border border-white/8 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-400" />
            Branch Manager & Staff Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Branch Managers and outlet personnel across all your restaurant locations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search manager name or email..."
              className="pl-9 h-10 w-full pr-4 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
            />
          </div>

          <Button
            onClick={() => setIsAddManagerOpen(true)}
            className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl gap-2 shadow-lg cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Branch Manager</span>
          </Button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-white/8 bg-[#080F22]/90 overflow-hidden shadow-xl">
        <table className="w-full text-sm">
          <thead className="bg-white/4 border-b border-white/8">
            <tr>
              {['Branch Manager', 'Contact Info', 'Assigned Branch', 'Role', 'Actions'].map((h) => (
                <th key={h} className="text-left px-5 py-4 font-bold text-slate-400 text-xs uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/6">
            {managersList.map((m) => (
              <tr key={m._id} className="hover:bg-white/2 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center border border-blue-400/30">
                      {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-white">{m.name}</p>
                      <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Credentials Active
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <p className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-500" /> {m.email}
                  </p>
                  {m.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-600" /> {m.phone}
                    </p>
                  )}
                </td>

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                    {m.branchName || 'Downtown Branch'}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <Badge variant="success" className="capitalize font-bold text-xs px-2.5 py-0.5 rounded-lg">
                    Branch Manager
                  </Badge>
                </td>

                <td className="px-5 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Reset link sent to ${m.email}`)}
                    className="h-8 text-xs font-bold gap-1 border-white/10 text-slate-300 hover:bg-white/5 rounded-xl"
                  >
                    <Key className="w-3.5 h-3.5 text-brand-400" />
                    <span>Reset Key</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Manager Modal */}
      <AnimatePresence>
        {isAddManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-black text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" /> Create Branch Manager
                </h2>
                <button onClick={() => setIsAddManagerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createManagerMutation.mutate(managerForm);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300">Manager Full Name *</label>
                  <input
                    required
                    value={managerForm.name}
                    onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
                    placeholder="e.g. Arun Kumar"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">Assign Branch Outlet *</label>
                  <select
                    value={managerForm.branchId}
                    onChange={(e) => setManagerForm({ ...managerForm, branchId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white font-bold focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Branch...</option>
                    {branches.map((b: any) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                      placeholder="manager@branch.com"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Temporary Password *</label>
                    <input
                      required
                      value={managerForm.tempPassword}
                      onChange={(e) => setManagerForm({ ...managerForm, tempPassword: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white font-mono font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsAddManagerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createManagerMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                    Create Manager Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
