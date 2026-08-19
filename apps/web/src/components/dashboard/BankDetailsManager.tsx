'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plus,
  Edit3,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  Info,
  CreditCard,
  QrCode,
  Calendar,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/utils';

const POPULAR_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Federal Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Canara Bank',
  'Bank of Baroda',
  'Union Bank of India',
  'JP Morgan Chase',
  'Citibank',
];

interface BankFormData {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'current' | 'savings';
  upiId: string;
  payoutSchedule: 'daily' | 'weekly' | 'monthly';
}

const INITIAL_FORM: BankFormData = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  confirmAccountNumber: '',
  ifscCode: '',
  branchName: '',
  accountType: 'current',
  upiId: '',
  payoutSchedule: 'daily',
};

export function BankDetailsManager() {
  const qc = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BankFormData>(INITIAL_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['owner', 'bank-details'],
    queryFn: async () => {
      const res = await api.get('/restaurants/owner/bank-details');
      return res.data?.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: Omit<BankFormData, 'confirmAccountNumber'>) => {
      const res = await api.post('/restaurants/owner/bank-details/request', payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['owner', 'bank-details'] });
      toast.success('🎉 Bank details submitted for Admin approval!');
      setIsModalOpen(false);
      setFormData(INITIAL_FORM);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const activeBank = data?.bankDetails;
  const pendingReq = data?.pendingBankRequest;
  const latestHistory = data?.history?.[0];
  const isRejected = latestHistory?.status === 'rejected' && !pendingReq;

  const handleOpenModal = () => {
    if (activeBank) {
      setFormData({
        bankName: activeBank.bankName || '',
        accountHolderName: activeBank.accountHolderName || '',
        accountNumber: activeBank.accountNumber || '',
        confirmAccountNumber: activeBank.accountNumber || '',
        ifscCode: activeBank.ifscCode || '',
        branchName: activeBank.branchName || '',
        accountType: activeBank.accountType || 'current',
        upiId: activeBank.upiId || '',
        payoutSchedule: activeBank.payoutSchedule || 'daily',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.bankName.trim()) {
      return toast.error('Please enter the bank name');
    }
    if (!formData.accountHolderName.trim()) {
      return toast.error('Please enter the account holder name');
    }
    if (!formData.accountNumber.trim()) {
      return toast.error('Please enter the account number');
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      return toast.error('Account numbers do not match!');
    }
    if (!formData.ifscCode.trim()) {
      return toast.error('Please enter the IFSC / SWIFT code');
    }

    const { confirmAccountNumber, ...payload } = formData;
    submitMutation.mutate(payload);
  };

  const maskAccount = (acc: string) => {
    if (!acc) return '•••• •••• ••••';
    if (acc.length <= 4) return `•••• ${acc}`;
    return `•••• •••• •••• ${acc.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Pending Approval Alert Banner ─────────────────────────────────── */}
      {pendingReq && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-lg relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-amber-300">Bank Details Update Pending Admin Approval</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Under Review
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 leading-relaxed max-w-2xl">
                  Requested changes to <strong className="text-white font-bold">{pendingReq.bankName}</strong> ({maskAccount(pendingReq.accountNumber)}) with IFSC <span className="font-mono text-amber-300 font-bold">{pendingReq.ifscCode}</span> submitted on {new Date(pendingReq.submittedAt || Date.now()).toLocaleDateString()}. Our security & compliance team reviews all payout bank updates. Your existing verified bank account remains active in the interim.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenModal}
              className="h-9 px-3.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shrink-0 gap-1.5 shadow-md cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Modify Request</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Rejected Notice Banner ────────────────────────────────────────── */}
      {isRejected && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-red-300">Bank Verification Rejected by Admin</h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                    Action Required
                  </span>
                </div>
                <p className="text-xs text-red-200/90 leading-relaxed">
                  Reason: <strong className="text-white font-semibold">&quot;{latestHistory.rejectionReason || 'Please verify IFSC and account holder name'}&quot;</strong>. Please review and re-submit your valid bank account credentials.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={handleOpenModal}
              className="h-9 px-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shrink-0 gap-1.5 shadow-md cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-submit Details</span>
            </Button>
          </div>
        </div>
      )}

      {/* ── Active Linked Bank Account Card ───────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-[#09122B]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Settlement & Payout Bank Account</h3>
                <p className="text-xs text-slate-400">All daily dining revenues and customer prepayments are routed here.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleOpenModal}
            className="h-10 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
          >
            {activeBank ? (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Request Bank Details Change</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Bank Account</span>
              </>
            )}
          </Button>
        </div>

        {activeBank ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Primary Bank Card */}
            <div className="p-5 rounded-2xl bg-[#0E1B3E] border border-blue-500/20 shadow-inner space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">Bank Entity</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Verified & Active
                </span>
              </div>
              <div>
                <h4 className="text-xl font-black text-white">{activeBank.bankName || 'HDFC Bank'}</h4>
                <p className="text-xs text-slate-300 font-medium mt-0.5">Holder: {activeBank.accountHolderName || 'Restaurant Owner'}</p>
              </div>
              <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">Acc: {maskAccount(activeBank.accountNumber)}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase">{activeBank.accountType || 'Current'}</span>
              </div>
            </div>

            {/* IFSC & Branch */}
            <div className="p-5 rounded-2xl bg-[#0B1530] border border-white/8 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Routing & IFSC</span>
              <div>
                <p className="text-lg font-mono font-black text-white">{activeBank.ifscCode || 'HDFC0001234'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Branch: {activeBank.branchName || 'Central Business Branch'}</p>
              </div>
              <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                <span className="text-slate-400">UPI VPA:</span>
                <span className="font-mono text-blue-300 font-bold">{activeBank.upiId || 'Not linked'}</span>
              </div>
            </div>

            {/* Payout Frequency */}
            <div className="p-5 rounded-2xl bg-[#0B1530] border border-white/8 space-y-3">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">Payout Schedule</span>
              <div>
                <p className="text-lg font-black text-white capitalize">{activeBank.payoutSchedule || 'Daily Automatic'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Automated settlement every night at 11:59 PM</p>
              </div>
              <div className="pt-2 border-t border-white/8 flex items-center justify-between text-xs">
                <span className="text-slate-400">Transfer Mode:</span>
                <span className="text-emerald-400 font-bold">NEFT / RTGS / IMPS</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-white/15 bg-white/2 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">No Payout Bank Account Linked</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Add your business bank account to enable direct settlements and withdrawals for table reservations and food orders.
              </p>
            </div>
            <Button
              onClick={handleOpenModal}
              className="h-9 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Add Bank Account
            </Button>
          </div>
        )}

        {/* Security / Admin Approval Notice Footer */}
        <div className="p-4 rounded-xl bg-white/3 border border-white/6 flex items-start gap-3">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Admin Approval Policy:</strong> To protect restaurant funds against unauthorized account tampering, any modification to your payout bank account or IFSC requires approval from the QuickBite compliance team before payouts are redirected.
          </p>
        </div>
      </div>

      {/* ── Add / Edit Bank Details Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0" onClick={() => setIsModalOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-[#09122B] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {activeBank ? 'Request Bank Details Update' : 'Add Payout Bank Details'}
                    </h3>
                    <p className="text-xs text-slate-400">Requires Admin review before activation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Bank Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank, SBI, ICICI Bank, Chase..."
                    list="popular-banks-list"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-medium"
                  />
                  <datalist id="popular-banks-list">
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                </div>

                {/* Account Holder Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    placeholder="Exact name as per bank records / passbook"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                {/* Account Number & Confirm Account Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Account Number *</label>
                    <input
                      type="password"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="Enter account number"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Account Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.confirmAccountNumber}
                      onChange={(e) => setFormData({ ...formData, confirmAccountNumber: e.target.value })}
                      placeholder="Re-enter account number"
                      className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white/4 text-white placeholder-slate-500 outline-none font-mono ${
                        formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                          ? 'border-red-500 focus:border-red-400'
                          : 'border-white/10 focus:border-purple-500'
                      }`}
                    />
                  </div>
                </div>

                {/* IFSC Code & Branch Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">IFSC / SWIFT Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Branch Name (Optional)</label>
                    <input
                      type="text"
                      value={formData.branchName}
                      onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                      placeholder="e.g. Main Branch"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Account Type, UPI ID, Payout Schedule */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Account Type</label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-white/10 bg-[#0B1530] text-white outline-none focus:border-purple-500"
                    >
                      <option value="current">Current Account</option>
                      <option value="savings">Savings Account</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">UPI ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="e.g. business@okaxis"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-white/4 text-white placeholder-slate-500 outline-none focus:border-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Payout Schedule</label>
                    <select
                      value={formData.payoutSchedule}
                      onChange={(e) => setFormData({ ...formData, payoutSchedule: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-white/10 bg-[#0B1530] text-white outline-none focus:border-purple-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Disclaimer Banner */}
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>
                    Submitting this form creates a verification request. The QuickBite admin team will review and approve these details before payouts are routed to this account.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={submitMutation.isPending}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-600/30 gap-2 cursor-pointer"
                  >
                    <span>Submit for Admin Approval</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
