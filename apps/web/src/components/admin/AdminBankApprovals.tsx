'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Phone,
  ArrowRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

export function AdminBankApprovals() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [unmaskedIds, setUnmaskedIds] = useState<Set<string>>(new Set());

  // Rejection modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Approval modal state
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'bank-requests', statusFilter],
    queryFn: async () => {
      const res = await api.get('/admin/bank-requests', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 },
      });
      return res.data;
    },
  });

  const requests = data?.data || [];

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const res = await api.patch(`/admin/bank-requests/${id}/approve`, { adminNotes: notes });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bank-requests'] });
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('🎉 Bank details verified & activated for payouts!');
      setApprovingId(null);
      setAdminNotes('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.patch(`/admin/bank-requests/${id}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bank-requests'] });
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('Bank request rejected');
      setRejectingId(null);
      setRejectionReason('');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggleMask = (id: string) => {
    setUnmaskedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredRequests = requests.filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.restaurantName?.toLowerCase().includes(q) ||
      r.ownerName?.toLowerCase().includes(q) ||
      r.bankName?.toLowerCase().includes(q) ||
      r.ifscCode?.toLowerCase().includes(q) ||
      r.accountHolderName?.toLowerCase().includes(q)
    );
  });

  const pendingCount = requests.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* ── Top Controls & Stats ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#09122B]/90 border border-white/8 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              Restaurant Bank Approvals
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-black animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Review, verify, and approve restaurant payout bank accounts.</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/4 rounded-xl border border-white/8">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search Input ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-[#09122B]/90 border border-white/8 rounded-2xl px-4 py-2.5 shadow-md">
        <Search className="w-4 h-4 text-purple-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by restaurant name, owner, IFSC, or bank name..."
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white text-xs font-bold">
            Clear
          </button>
        )}
      </div>

      {/* ── Requests Cards Grid / List ───────────────────────────────────── */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400" />
          <p className="text-xs font-bold">Loading bank verification requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-16 rounded-3xl border border-white/8 bg-[#09122B]/50 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
          <h4 className="text-sm font-bold text-white">No {statusFilter !== 'all' ? statusFilter : ''} bank verification requests</h4>
          <p className="text-xs text-slate-400">All submitted restaurant bank details are currently up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req: any) => {
            const isUnmasked = unmaskedIds.has(req._id);
            const maskedAcc = req.accountNumber
              ? isUnmasked
                ? req.accountNumber
                : `•••• •••• •••• ${req.accountNumber.slice(-4)}`
              : 'N/A';

            return (
              <div
                key={req._id}
                className="p-5 sm:p-6 rounded-2xl bg-[#09122B]/90 border border-white/10 shadow-xl backdrop-blur-xl space-y-4 hover:border-purple-500/30 transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-black text-white">{req.restaurantName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : req.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      }`}>
                        {req.status === 'pending' ? 'Pending Review' : req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>Owner: <strong className="text-slate-200">{req.ownerName}</strong></span>
                      <span>•</span>
                      <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                    </p>
                  </div>

                  {/* Actions for Pending Requests */}
                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        onClick={() => {
                          setRejectingId(req._id);
                          setRejectionReason('');
                        }}
                        className="h-9 px-3.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-bold text-xs rounded-xl gap-1.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          setApprovingId(req._id);
                          setAdminNotes('');
                        }}
                        className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl gap-1.5 shadow-lg shadow-emerald-600/30 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Bank Details</span>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bank Credentials Detail Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/2 p-4 rounded-xl border border-white/6 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Bank Name</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{req.bankName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Account Holder</span>
                    <span className="font-bold text-slate-200 mt-0.5 block">{req.accountHolderName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Account Number</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-white">{maskedAcc}</span>
                      <button
                        type="button"
                        onClick={() => toggleMask(req._id)}
                        className="text-slate-400 hover:text-white p-0.5"
                        title={isUnmasked ? 'Mask number' : 'Show full number'}
                      >
                        {isUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">IFSC / SWIFT</span>
                    <span className="font-mono font-black text-purple-300 mt-0.5 block">{req.ifscCode}</span>
                  </div>

                  {req.branchName && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Branch</span>
                      <span className="text-slate-300 mt-0.5 block">{req.branchName}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Account Type</span>
                    <span className="text-slate-300 font-semibold uppercase mt-0.5 block">{req.accountType}</span>
                  </div>

                  {req.upiId && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">UPI VPA</span>
                      <span className="font-mono text-blue-300 font-bold mt-0.5 block">{req.upiId}</span>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Payout Frequency</span>
                    <span className="text-slate-300 capitalize mt-0.5 block">{req.payoutSchedule}</span>
                  </div>
                </div>

                {/* Audit & Decision Trail */}
                {req.status === 'approved' && req.reviewedAt && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      Approved and active for direct merchant settlements.
                    </span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      Verified {new Date(req.reviewedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {req.status === 'rejected' && req.rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      Rejection Reason: <strong>&quot;{req.rejectionReason}&quot;</strong>
                    </span>
                    <span className="text-[10px] text-red-400/80 font-mono">
                      Reviewed {new Date(req.reviewedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Approval Modal Confirmation ──────────────────────────────────── */}
      <AnimatePresence>
        {approvingId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setApprovingId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#09122B] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Approve Bank Details</h3>
                  <p className="text-xs text-slate-400">Activate this bank account for daily settlements</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin Verification Notes (Optional)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Verified with cancelled cheque / passbook copy"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
                <Button variant="ghost" onClick={() => setApprovingId(null)} className="h-9 px-3 text-xs text-slate-400">
                  Cancel
                </Button>
                <Button
                  onClick={() => approveMutation.mutate({ id: approvingId, notes: adminNotes })}
                  isLoading={approveMutation.isPending}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                >
                  Confirm & Approve
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Rejection Modal Confirmation ─────────────────────────────────── */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setRejectingId(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#09122B] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Reject Bank Details</h3>
                  <p className="text-xs text-slate-400">Provide a clear reason for the restaurant owner</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Rejection Reason *</label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. IFSC code does not match branch name, or account holder name mismatch."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
                <Button variant="ghost" onClick={() => setRejectingId(null)} className="h-9 px-3 text-xs text-slate-400">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!rejectionReason.trim()) {
                      return toast.error('Please enter a rejection reason');
                    }
                    rejectMutation.mutate({ id: rejectingId, reason: rejectionReason });
                  }}
                  isLoading={rejectMutation.isPending}
                  className="h-9 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl"
                >
                  Confirm Rejection
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
