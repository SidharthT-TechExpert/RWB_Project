'use client';

import React, { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { useCurrentBranch } from '@/hooks/useBranches';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Phone,
  Armchair,
  X,
  Filter
} from 'lucide-react';

interface Booking {
  id: string;
  guestName: string;
  phone: string;
  guestCount: number;
  time: string;
  tableNo: string;
  status: 'confirmed' | 'checked_in' | 'reserved' | 'cancelled';
  specialNotes?: string;
}

const INITIAL_BOOKINGS: Booking[] = [
  { id: 'b1', guestName: 'Thomas Mathew', phone: '+1 212-555-0144', guestCount: 4, time: '19:30', tableNo: 'T-04', status: 'confirmed', specialNotes: 'Anniversary celebration. Window table preferred.' },
  { id: 'b2', guestName: 'Priya Sharma', phone: '+1 212-555-0188', guestCount: 2, time: '20:00', tableNo: 'T-02', status: 'checked_in' },
  { id: 'b3', guestName: 'Alex Vance', phone: '+1 212-555-0199', guestCount: 6, time: '21:15', tableNo: 'T-08 (VIP)', status: 'reserved', specialNotes: 'High-chair requested.' },
  { id: 'b4', guestName: 'Riya Kapoor', phone: '+1 212-555-0211', guestCount: 3, time: '21:30', tableNo: 'T-05', status: 'confirmed' },
];

export default function ManagerBookingsPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestCount, setGuestCount] = useState('2');
  const [time, setTime] = useState('19:00');
  const [tableNo, setTableNo] = useState('T-01');
  const [notes, setNotes] = useState('');

  const handleUpdateStatus = (id: string, nextStatus: Booking['status']) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          toast.success(`Booking for ${b.guestName} updated to ${nextStatus.toUpperCase().replace('_', ' ')}`);
          return { ...b, status: nextStatus };
        }
        return b;
      })
    );
  };

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !phone.trim()) {
      toast.error('Please enter guest name and phone number');
      return;
    }

    const created: Booking = {
      id: `b_${Date.now()}`,
      guestName: guestName.trim(),
      phone: phone.trim(),
      guestCount: parseInt(guestCount) || 2,
      time,
      tableNo,
      status: 'confirmed',
      specialNotes: notes.trim() || undefined,
    };

    setBookings((prev) => [created, ...prev]);
    toast.success(`Reservation confirmed for ${created.guestName}! 🎉`);

    setGuestName('');
    setPhone('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tableNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#030816] text-slate-100 min-h-screen">
      <ManagerHeader pageTitle="Table Reservations & Bookings" />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[2400px] w-full mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070D1F] p-4 sm:p-6 rounded-2xl border border-white/8 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase">
                {branchName}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400 font-medium">Guest Bookings</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 shrink-0" />
              Table Reservations &amp; Bookings
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Walk-in / Reservation</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['all', 'confirmed', 'checked_in', 'reserved', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-[#080F22]/90 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guest or table no…"
              className="w-full bg-[#080F22]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="rounded-2xl bg-[#080F22]/90 border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Today's Table Bookings</h3>
            <span className="text-xs text-slate-500 font-mono">
              Showing {filteredBookings.length} reservations
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredBookings.map((b) => (
              <div key={b.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/2 transition-colors">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs flex items-center justify-center shrink-0">
                    {b.guestName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{b.guestName}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        {b.tableNo}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> {b.guestCount} guests
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.time}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {b.phone}
                      </span>
                    </div>

                    {b.specialNotes && (
                      <p className="text-xs text-amber-400/90 italic font-medium pt-0.5">
                        &quot;{b.specialNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                    b.status === 'confirmed' ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' :
                    b.status === 'checked_in' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                    b.status === 'reserved' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' :
                    'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>

                  {b.status !== 'checked_in' && b.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'checked_in')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Seat Guest</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* New Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-400" />
                New Reservation / Walk-in
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Guest Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  required
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 212-555-0199"
                    required
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Guest Count</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    placeholder="2"
                    min="1"
                    required
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Assigned Table</label>
                  <input
                    type="text"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    placeholder="T-01"
                    required
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Special Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Seating preferences or dietary requests…"
                  rows={2}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
