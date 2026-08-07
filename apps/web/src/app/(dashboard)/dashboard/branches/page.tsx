'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, MapPin, Phone, Mail, UserCheck,
  CheckCircle2, XCircle, Store, X, UserPlus, Lock, ShieldCheck, Sparkles, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useMyRestaurants } from '@/hooks/useRestaurants';

interface BranchItem {
  _id: string;
  name: string;
  code: string;
  phone: string;
  email?: string;
  managerId?: string;
  managerName?: string;
  status: 'active' | 'inactive' | 'suspended';
  address: { street: string; city: string; state: string };
  tablesCount: number;
}

export default function BranchesPage() {
  const [search, setSearch] = useState('');
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isEditBranchOpen, setIsEditBranchOpen] = useState(false);
  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    phone: '+1 212-555-0199',
    email: '',
    street: '123 Main Street',
    city: 'New York',
    tablesCount: 20,
  });

  const [editBranchForm, setEditBranchForm] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    tablesCount: 20,
  });

  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '+1 212-555-0199',
    tempPassword: 'Manager@123',
  });

  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;
  const queryClient = useQueryClient();

  // Fetch branches
  const { data, isLoading } = useQuery({
    queryKey: ['branches', restaurantId],
    queryFn: async () => {
      if (restaurantId) {
        try {
          const res = await api.get(`/branches/restaurant/${restaurantId}`);
          if (res.data?.data?.length > 0) return res.data;
        } catch {}
      }
      const res = await api.get('/branches/owner/my-branches');
      return res.data;
    },
    enabled: true,
  });

  // Default mock branches if database empty
  const defaultBranches: BranchItem[] = [
    {
      _id: 'b1',
      name: `${restaurant?.name || 'Paragon'} — Downtown Branch`,
      code: 'BR-NY-01',
      phone: '+1 212-555-0199',
      email: 'downtown@paragon.com',
      managerName: 'Arun Kumar',
      status: 'active',
      address: { street: '45 Park Avenue', city: 'New York', state: 'NY' },
      tablesCount: 24,
    },
    {
      _id: 'b2',
      name: `${restaurant?.name || 'Paragon'} — Uptown Branch`,
      code: 'BR-NY-02',
      phone: '+1 212-555-0144',
      email: 'uptown@paragon.com',
      managerName: 'Priya Sharma',
      status: 'active',
      address: { street: '128 Mercer St', city: 'New York', state: 'NY' },
      tablesCount: 18,
    },
  ];

  const branchesList: BranchItem[] = (data?.data?.length > 0 ? data.data : defaultBranches).filter((b: BranchItem) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.code.toLowerCase().includes(search.toLowerCase())
  );

  // Create Branch Mutation
  const createBranchMutation = useMutation({
    mutationFn: async (payload: typeof branchForm) => {
      return api.post('/branches', {
        restaurantId,
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('🎉 Branch registered successfully!');
      setIsAddBranchOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create branch');
    },
  });

  // Update Branch Mutation
  const updateBranchMutation = useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: string; payload: typeof editBranchForm }) => {
      const res = await api.put(`/branches/${branchId}`, payload);
      return res.data;
    },
    onSuccess: (resData) => {
      if (resData?.data) {
        const updatedBranch = resData.data;
        queryClient.setQueryData(['branches', restaurantId], (old: any) => {
          const currentList = old?.data || [];
          const exists = currentList.some((b: BranchItem) => b._id === updatedBranch._id || b.code === updatedBranch.code);
          const newList = exists
            ? currentList.map((b: BranchItem) => (b._id === updatedBranch._id || b.code === updatedBranch.code ? updatedBranch : b))
            : [updatedBranch, ...currentList];
          return { ...old, data: newList };
        });
      }
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('🎉 Branch updated successfully!');
      setIsEditBranchOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update branch');
    },
  });

  // Assign Manager Mutation
  const assignManagerMutation = useMutation({
    mutationFn: async ({ branchId, payload }: { branchId: string; payload: typeof managerForm }) => {
      return api.post(`/branches/${branchId}/manager`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      toast.success('🎉 Branch Manager assigned & credentials issued!');
      setIsAssignManagerOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to assign manager');
    },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#09122B]/90 p-6 rounded-2xl border border-white/8 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-500" />
            Branch Management (Outlets)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register and oversee all physical restaurant branches, assign Branch Managers, and configure outlet parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search branch by name or code..."
              className="pl-9 h-10 w-full pr-4 rounded-xl border border-white/10 bg-white/5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500/40"
            />
          </div>

          <Button
            onClick={() => setIsAddBranchOpen(true)}
            className="h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Branch</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Total Registered Outlets</p>
            <p className="text-xl font-black text-white">{branchesList.length} Branches</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Active Outlets</p>
            <p className="text-xl font-black text-emerald-400">{branchesList.filter(b => b.status === 'active').length} Online</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/8 bg-white/2 backdrop-blur-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500 uppercase">Assigned Managers</p>
            <p className="text-xl font-black text-white">{branchesList.filter(b => b.managerName).length} Managers</p>
          </div>
        </div>
      </div>

      {/* Main Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {branchesList.map((b) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl border border-white/8 bg-[#080F22]/90 backdrop-blur-xl space-y-4 shadow-xl hover:border-white/15 transition-all"
          >
            {/* Branch Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-400 uppercase">
                  {b.code}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{b.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedBranch(b);
                    setEditBranchForm({
                      name: b.name || '',
                      code: b.code || '',
                      phone: b.phone || '',
                      email: b.email || '',
                      street: b.address?.street || '',
                      city: b.address?.city || '',
                      status: b.status || 'active',
                      tablesCount: b.tablesCount || 20,
                    });
                    setIsEditBranchOpen(true);
                  }}
                  className="h-7 text-xs font-bold gap-1 px-2.5 border-white/10 text-slate-300 hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-400" />
                  <span>Edit</span>
                </Button>
                <Badge variant={b.status === 'active' ? 'success' : 'secondary'} className="capitalize font-bold text-xs px-2.5 py-0.5 rounded-lg">
                  {b.status}
                </Badge>
              </div>
            </div>

            {/* Branch Details */}
            <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-white/6 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>{b.address?.street || 'No street specified'}{b.address?.city ? `, ${b.address.city}` : ''}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{b.phone}</span>
              </div>
              {b.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{b.email}</span>
                </div>
              )}
            </div>

            {/* Manager Box */}
            <div className="p-3.5 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500 uppercase">Branch Manager</p>
                  <p className="text-xs font-bold text-white">{b.managerName || 'Unassigned'}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedBranch(b);
                  setManagerForm({
                    name: b.managerName || '',
                    email: b.email ? b.email.replace('@', '.manager@') : 'downtown.manager@paragon.com',
                    phone: b.phone || '+1 212-555-0199',
                    tempPassword: 'Manager@123',
                  });
                  setIsAssignManagerOpen(true);
                }}
                className="h-8 text-xs font-bold gap-1.5 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-xl"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{b.managerName ? 'Change Manager' : 'Assign Manager'}</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Branch Modal */}
      <AnimatePresence>
        {isAddBranchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-black text-lg text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" /> Register New Branch Outlet
                </h2>
                <button onClick={() => setIsAddBranchOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createBranchMutation.mutate(branchForm);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300">Branch Name *</label>
                  <input
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="e.g. Paragon — Westside Outlet"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Branch Code *</label>
                    <input
                      required
                      value={branchForm.code}
                      onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })}
                      placeholder="e.g. BR-NY-03"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Phone Number *</label>
                    <input
                      required
                      value={branchForm.phone}
                      onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      placeholder="+1 212-555-0199"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">City *</label>
                    <input
                      required
                      value={branchForm.city}
                      onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                      placeholder="New York"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Street Address *</label>
                    <input
                      required
                      value={branchForm.street}
                      onChange={(e) => setBranchForm({ ...branchForm, street: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsAddBranchOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={createBranchMutation.isPending} className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
                    Register Branch
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Manager Modal */}
      <AnimatePresence>
        {isAssignManagerOpen && selectedBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-black text-lg text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-400" /> Assign Branch Manager
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedBranch.name} ({selectedBranch.code})</p>
                </div>
                <button onClick={() => setIsAssignManagerOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  assignManagerMutation.mutate({ branchId: selectedBranch._id, payload: managerForm });
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Manager Email Address *</label>
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
                  <Button type="button" variant="outline" onClick={() => setIsAssignManagerOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={assignManagerMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                    Issue Credentials & Assign
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Edit Branch Modal */}
      <AnimatePresence>
        {isEditBranchOpen && selectedBranch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-black text-lg text-white flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-brand-400" /> Edit Branch Outlet
                </h2>
                <button onClick={() => setIsEditBranchOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateBranchMutation.mutate({ branchId: selectedBranch._id, payload: editBranchForm });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-300">Branch Name *</label>
                  <input
                    required
                    value={editBranchForm.name}
                    onChange={(e) => setEditBranchForm({ ...editBranchForm, name: e.target.value })}
                    placeholder="e.g. Paragon — Westside Outlet"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Branch Code *</label>
                    <input
                      required
                      value={editBranchForm.code}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, code: e.target.value })}
                      placeholder="e.g. BR-NY-03"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Phone Number *</label>
                    <input
                      required
                      value={editBranchForm.phone}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, phone: e.target.value })}
                      placeholder="+1 212-555-0199"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Branch Email</label>
                    <input
                      type="email"
                      value={editBranchForm.email}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, email: e.target.value })}
                      placeholder="branch@paragon.com"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Outlet Status *</label>
                    <select
                      value={editBranchForm.status}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, status: e.target.value as any })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none font-bold capitalize"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Street Address *</label>
                    <input
                      required
                      value={editBranchForm.street}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, street: e.target.value })}
                      placeholder="123 Main Street"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">City *</label>
                    <input
                      required
                      value={editBranchForm.city}
                      onChange={(e) => setEditBranchForm({ ...editBranchForm, city: e.target.value })}
                      placeholder="New York"
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-brand-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsEditBranchOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={updateBranchMutation.isPending} className="bg-brand-500 hover:bg-brand-600 text-white font-bold">
                    Save Changes
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
