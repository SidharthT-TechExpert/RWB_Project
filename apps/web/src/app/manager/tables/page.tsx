'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Users, Plus, CheckCircle2, UserPlus, X, TableProperties, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddTable, AddTablePayload, useRestaurant } from '@/hooks/useRestaurants';
import { useMyBranch } from '@/hooks/useBranches';

// ─── Types ────────────────────────────────────────────────────────────────────

type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  type: string;
  description?: string;
  status: TableStatus;
  currentGuest?: string;
  reservedTime?: string;
}

const TABLE_TYPES = ['indoor', 'outdoor', 'private', 'bar'] as const;

const STATUS_COLORS: Record<TableStatus, string> = {
  available: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  occupied: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  reserved: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  cleaning: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerTablesPage() {
  // Real data from API
  const { data: myBranch, isLoading: isBranchLoading } = useMyBranch();
  const restaurantId = myBranch?.restaurantId ?? '';

  const addTableMutation = useAddTable(restaurantId);

  // Fetch the restaurant to get the live tables list
  const { data: restaurant, isLoading: isRestaurantLoading } = useRestaurant(restaurantId);
  const isLoading = isBranchLoading || isRestaurantLoading;

  // Local UI state layered on top of API tables
  const [localStatus, setLocalStatus] = useState<Record<string, TableStatus>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState<{
    tableNumber: string;
    capacity: string;
    type: (typeof TABLE_TYPES)[number];
    description: string;
  }>({
    tableNumber: '',
    capacity: '4',
    type: 'indoor',
    description: '',
  });

  // ── Derive tables list ──────────────────────────────────────────────────────

  const apiTables: TableItem[] = (restaurant?.tables ?? []).map((t) => ({
    id: t.tableNumber,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    type: t.type,
    description: undefined,
    status: localStatus[t.tableNumber] ?? (t.isAvailable ? 'available' : 'occupied'),
  }));

  // ── Handlers ───────────────────────────────────────────────────────────────

  const updateTableStatus = (id: string, status: TableStatus) => {
    setLocalStatus((prev) => ({ ...prev, [id]: status }));
    toast.success(`Table ${id} set to ${status.toUpperCase()}`);
  };

  const resetForm = () => {
    setForm({ tableNumber: '', capacity: '4', type: 'indoor', description: '' });
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();

    const capacityNum = parseInt(form.capacity, 10);

    if (!form.tableNumber.trim()) {
      toast.error('Table number is required');
      return;
    }
    if (!capacityNum || capacityNum < 1) {
      toast.error('Capacity must be at least 1');
      return;
    }
    if (!restaurantId) {
      toast.error('No restaurant found. Please set up your restaurant first.');
      return;
    }

    const payload: AddTablePayload = {
      tableNumber: form.tableNumber.trim(),
      capacity: capacityNum,
      type: form.type,
      isAvailable: true,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };

    addTableMutation.mutate(payload, {
      onSuccess: () => {
        handleCloseModal();
      },
    });
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total = apiTables.length;
  const available = apiTables.filter((t) => (localStatus[t.tableNumber] ?? t.status) === 'available').length;
  const occupied = apiTables.filter((t) => (localStatus[t.tableNumber] ?? t.status) === 'occupied').length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Branch Tables & Reservations" />

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-16">

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070D1F] p-6 rounded-2xl border border-white/8 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-purple-400" />
              Floor Plan &amp; Seating Roster
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage live table availability, guest check-ins, and walk-in assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAddModal(true)}
              disabled={!restaurantId || isLoading}
              className="bg-white/6 hover:bg-white/10 border border-white/10 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add Table</span>
            </Button>
            <Button
              onClick={() => toast.success('Add Walk-in Check-in Modal')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>Walk-in Check-in</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#060C1E] border border-white/8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Total Tables</p>
              <p className="text-2xl font-black text-white mt-1 tabular-nums">{total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <TableProperties className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060C1E] border border-white/8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Available</p>
              <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{available}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#060C1E] border border-white/8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Occupied</p>
              <p className="text-2xl font-black text-rose-400 mt-1 tabular-nums">{occupied}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* No restaurant found */}
        {!isLoading && !restaurant && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-300">No restaurant found</p>
            <p className="text-xs text-slate-500 max-w-xs">
              Your account doesn&apos;t have a restaurant set up yet. Please create one from the dashboard first.
            </p>
          </div>
        )}

        {/* Empty tables state */}
        {!isLoading && restaurant && apiTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center bg-[#060C1E] rounded-2xl border border-white/8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <TableProperties className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No tables yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Get started by adding your first table to the floor plan.
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-5 mt-2"
            >
              <Plus className="w-4 h-4" />
              Add First Table
            </Button>
          </div>
        )}

        {/* Tables Grid */}
        {!isLoading && apiTables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {apiTables.map((t) => {
              const status: TableStatus = (localStatus[t.tableNumber] ?? t.status) as TableStatus;
              return (
                <div key={t.id} className="p-5 rounded-2xl bg-[#060C1E] border border-white/8 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-lg text-white">{t.tableNumber}</span>
                      <p className="text-[10px] text-slate-400 font-medium capitalize">{t.type}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[status]}`}>
                      {status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/4 border border-white/6 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Capacity:</span>
                      <span className="font-bold text-white">{t.capacity} Guests</span>
                    </div>
                    {t.description && (
                      <div className="flex justify-between text-slate-400">
                        <span>Note:</span>
                        <span className="font-bold text-white text-right max-w-[120px] truncate">{t.description}</span>
                      </div>
                    )}
                    {t.currentGuest && (
                      <div className="flex justify-between text-slate-400">
                        <span>Guest:</span>
                        <span className="font-bold text-white">{t.currentGuest}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {status !== 'available' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTableStatus(t.id, 'available')}
                        className="h-8 text-xs font-bold text-emerald-400 border-emerald-500/30"
                      >
                        Set Free
                      </Button>
                    )}
                    {status === 'available' && (
                      <Button
                        size="sm"
                        onClick={() => updateTableStatus(t.id, 'occupied')}
                        className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white col-span-2"
                      >
                        Occupy Table
                      </Button>
                    )}
                    {status === 'occupied' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTableStatus(t.id, 'cleaning')}
                        className="h-8 text-xs font-bold text-purple-400 border-purple-500/30"
                      >
                        Clean Table
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── MODAL: ADD TABLE ─────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-purple-400" />
                Add New Table
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={addTableMutation.isPending}
                className="text-slate-500 hover:text-white transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTable} className="space-y-4">

              {/* Table Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Table Number / ID
                </label>
                <input
                  type="text"
                  value={form.tableNumber}
                  onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))}
                  placeholder="e.g. T-09, VIP-01, BAR-03"
                  required
                  autoFocus
                  disabled={addTableMutation.isPending}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Capacity + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Capacity (Guests)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    required
                    disabled={addTableMutation.isPending}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Table Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as typeof form.type }))}
                    disabled={addTableMutation.isPending}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500 transition-colors disabled:opacity-50 capitalize"
                  >
                    {TABLE_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Description <span className="text-slate-600 font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Window seat, near stage, rooftop…"
                  disabled={addTableMutation.isPending}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={addTableMutation.isPending}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addTableMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {addTableMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add Table
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
