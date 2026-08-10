'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Users, Plus, CheckCircle2, UserPlus, X, TableProperties, Loader2, AlertCircle, EyeOff, Eye, Pencil, QrCode, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAddTable, useUpdateTable, useToggleTableAvailability, AddTablePayload, EditTablePayload, useRestaurant } from '@/hooks/useRestaurants';
import { useMyBranch } from '@/hooks/useBranches';
import { TableQRModal } from '@/components/manager/TableQRModal';
import { BulkPrintStandeesModal } from '@/components/manager/BulkPrintStandeesModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const TABLE_TYPES = ['indoor', 'outdoor', 'private', 'bar'] as const;
const SEATING_CATEGORIES = ['regular', 'family', 'business', 'vip', 'couple'] as const;

type TableType = (typeof TABLE_TYPES)[number];
type SeatingCategory = (typeof SEATING_CATEGORIES)[number];
type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';

const STATUS_COLORS: Record<TableStatus, string> = {
  available:   'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  occupied:    'bg-rose-500/15 border-rose-500/30 text-rose-400',
  reserved:    'bg-amber-500/15 border-amber-500/30 text-amber-400',
  cleaning:    'bg-purple-500/15 border-purple-500/30 text-purple-400',
  maintenance: 'bg-slate-500/15 border-slate-500/30 text-slate-400',
};

const CATEGORY_LABELS: Record<SeatingCategory, string> = {
  regular:  'Regular',
  family:   'Family',
  business: 'Business',
  vip:      'VIP',
  couple:   'Couple',
};

const CATEGORY_COLORS: Record<SeatingCategory, string> = {
  regular:  'bg-slate-500/15 text-slate-400',
  family:   'bg-blue-500/15 text-blue-400',
  business: 'bg-cyan-500/15 text-cyan-400',
  vip:      'bg-amber-500/15 text-amber-400',
  couple:   'bg-pink-500/15 text-pink-400',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  type: string;
  seatingCategory: string;
  description?: string;
  status: TableStatus;
  isAvailable: boolean;
}

interface FormState {
  tableNumber: string;
  capacity: string;
  type: TableType;
  seatingCategory: SeatingCategory;
  description: string;
}

const DEFAULT_FORM: FormState = {
  tableNumber: '',
  capacity: '4',
  type: 'indoor',
  seatingCategory: 'regular',
  description: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ManagerTablesPage() {
  const { data: myBranch, isLoading: isBranchLoading } = useMyBranch();
  const restaurantId = myBranch?.restaurantId ?? '';

  const addTableMutation = useAddTable(restaurantId);
  const updateTableMutation = useUpdateTable(restaurantId);
  const toggleAvailabilityMutation = useToggleTableAvailability(restaurantId);

  const { data: restaurant, isLoading: isRestaurantLoading } = useRestaurant(restaurantId);
  const isLoading = isBranchLoading || isRestaurantLoading;

  const [localStatus, setLocalStatus] = useState<Record<string, TableStatus>>({});
  const [togglingTable, setTogglingTable] = useState<string | null>(null);
  const [confirmUnlistTable, setConfirmUnlistTable] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedQRTable, setSelectedQRTable] = useState<TableItem | null>(null);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [editForm, setEditForm] = useState<EditTablePayload & { tableNumber: string }>({ tableNumber: '', capacity: 4, type: 'indoor', seatingCategory: 'regular', description: '' });
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // ── Derive tables ───────────────────────────────────────────────────────────

  const apiTables: TableItem[] = (restaurant?.tables ?? []).map((t) => ({
    id: t.tableNumber,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    type: t.type,
    seatingCategory: (t as any).seatingCategory ?? 'regular',
    description: (t as any).description,
    isAvailable: t.isAvailable,
    status: localStatus[t.tableNumber] ?? (t.isAvailable ? 'available' : 'occupied'),
  }));

  const total     = apiTables.length;
  const available = apiTables.filter((t) => t.isAvailable && (localStatus[t.tableNumber] ?? t.status) === 'available').length;
  const occupied  = apiTables.filter((t) => t.isAvailable && (localStatus[t.tableNumber] ?? t.status) === 'occupied').length;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const updateTableStatus = (id: string, status: TableStatus) => {
    setLocalStatus((prev) => ({ ...prev, [id]: status }));
    toast.success(`Table ${id} set to ${status.toUpperCase()}`);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setForm(DEFAULT_FORM);
  };

  const handleOpenEdit = (t: TableItem) => {
    setEditingTable(t);
    setEditForm({
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      type: t.type as TableType,
      seatingCategory: (t.seatingCategory as SeatingCategory) ?? 'regular',
      description: t.description ?? '',
    });
  };

  const handleCloseEdit = () => {
    setEditingTable(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.capacity || editForm.capacity < 1) return toast.error('Capacity must be at least 1');
    updateTableMutation.mutate(
      {
        tableNumber: editForm.tableNumber,
        capacity: Number(editForm.capacity),
        type: editForm.type,
        seatingCategory: editForm.seatingCategory,
        description: editForm.description?.trim() || undefined,
      },
      { onSuccess: handleCloseEdit }
    );
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityNum = parseInt(form.capacity, 10);
    if (!form.tableNumber.trim()) return toast.error('Table number is required');
    if (!capacityNum || capacityNum < 1) return toast.error('Capacity must be at least 1');

    const payload: AddTablePayload = {
      tableNumber: form.tableNumber.trim().toUpperCase(),
      capacity: capacityNum,
      type: form.type,
      seatingCategory: form.seatingCategory,
      isAvailable: true,
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };

    addTableMutation.mutate(payload, { onSuccess: handleCloseModal });
  };

  const field = (label: string, children: React.ReactNode, hint?: string) => (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
        {label}
        {hint && <span className="text-slate-600 font-normal normal-case text-[10px]">{hint}</span>}
      </label>
      {children}
    </div>
  );

  const inputCls = `w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white
    placeholder-slate-600 outline-none focus:border-purple-500 transition-colors disabled:opacity-50`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Branch Tables & Reservations" />

      <main className="p-6 space-y-6 max-w-[1600px] w-full mx-auto pb-16">

        {/* Header */}
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
              onClick={() => setShowBulkPrintModal(true)}
              disabled={apiTables.length === 0}
              className="bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs gap-2 rounded-xl h-10 px-4"
            >
              <Printer className="w-4 h-4 text-purple-400" />
              <span>Print All Standees</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              disabled={!restaurantId || isLoading}
              className="bg-white/6 hover:bg-white/10 border border-white/10 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4"
            >
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Add Table</span>
            </Button>
            <Button
              onClick={() => toast.success('Walk-in Check-in coming soon')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-4"
            >
              <UserPlus className="w-4 h-4" />
              <span>Walk-in Check-in</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Tables', value: total, color: 'purple', Icon: TableProperties },
            { label: 'Available',    value: available, color: 'emerald', Icon: CheckCircle2 },
            { label: 'Occupied',     value: occupied,  color: 'rose',    Icon: Users },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="p-4 rounded-2xl bg-[#060C1E] border border-white/8 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                <p className={`text-2xl font-black mt-1 tabular-nums text-${color}-400`}>{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 text-${color}-400 flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {!isLoading && !restaurant && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-300">No restaurant found</p>
            <p className="text-xs text-slate-500 max-w-xs">Your account doesn&apos;t have a restaurant linked yet.</p>
          </div>
        )}

        {!isLoading && restaurant && apiTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center bg-[#060C1E] rounded-2xl border border-white/8">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <TableProperties className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No tables yet</p>
              <p className="text-xs text-slate-400 mt-1">Get started by adding your first table to the floor plan.</p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs gap-2 rounded-xl h-10 px-5 mt-2"
            >
              <Plus className="w-4 h-4" /> Add First Table
            </Button>
          </div>
        )}

        {/* Tables Grid */}
        {!isLoading && apiTables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {apiTables.map((t) => {
              const status: TableStatus = (localStatus[t.tableNumber] ?? t.status) as TableStatus;
              const effectiveStatus = !t.isAvailable ? 'maintenance' : status;
              const cat = (t.seatingCategory ?? 'regular') as SeatingCategory;
              return (
                <div key={t.id} className={`p-5 rounded-2xl bg-[#060C1E] border space-y-4 shadow-xl ${!t.isAvailable ? 'border-slate-800/50' : 'border-white/8'}`}>
                  {/* Dim header + details when unlisted, but NOT the action buttons */}
                  <div className={!t.isAvailable ? 'opacity-60' : ''}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-lg text-white">{t.tableNumber}</span>
                        {!t.isAvailable && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/20 border border-slate-600/40 text-slate-400 flex items-center gap-1">
                            <EyeOff className="w-2.5 h-2.5" /> Unlisted
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">{t.type}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setSelectedQRTable(t)}
                        className="w-7 h-7 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 flex items-center justify-center transition-all"
                        title="View & Download Table QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="w-7 h-7 rounded-lg bg-white/4 hover:bg-purple-500/15 border border-white/8 hover:border-purple-500/30 text-slate-500 hover:text-purple-400 flex items-center justify-center transition-all"
                        title="Edit table details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[effectiveStatus]}`}>
                        {!t.isAvailable ? 'unavailable' : status}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/4 border border-white/6 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Capacity</span>
                      <span className="font-bold text-white">{t.capacity} Guests</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Category</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[cat]}`}>
                        {CATEGORY_LABELS[cat]}
                      </span>
                    </div>
                    {t.description && (
                      <div className="flex justify-between text-slate-400 gap-2">
                        <span className="shrink-0">Note</span>
                        <span className="font-bold text-white text-right truncate">{t.description}</span>
                      </div>
                    )}
                  </div>
                  </div>{/* end dimmed section */}

                  {/* Status actions — only shown when table is listed */}
                  {t.isAvailable ? (
                    <div className="grid grid-cols-2 gap-2">
                      {status !== 'available' && (
                        <Button size="sm" variant="outline" onClick={() => updateTableStatus(t.id, 'available')}
                          className="h-8 text-xs font-bold text-emerald-400 border-emerald-500/30">
                          Set Free
                        </Button>
                      )}
                      {status === 'available' && (
                        <Button size="sm" onClick={() => updateTableStatus(t.id, 'occupied')}
                          className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white col-span-2">
                          Occupy Table
                        </Button>
                      )}
                      {status === 'occupied' && (
                        <Button size="sm" variant="outline" onClick={() => updateTableStatus(t.id, 'cleaning')}
                          className="h-8 text-xs font-bold text-purple-400 border-purple-500/30">
                          Clean Table
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-500/8 border border-slate-700/50">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <p className="text-[11px] text-slate-500">Table is unlisted — list it to manage status.</p>
                    </div>
                  )}

                  {/* List / Unlist — persisted to DB */}
                  <div className="pt-1 border-t border-white/6">
                    <button
                      onClick={() => {
                        if (t.isAvailable) {
                          setConfirmUnlistTable(t.tableNumber);
                        } else {
                          setTogglingTable(t.tableNumber);
                          toggleAvailabilityMutation.mutate(
                            { tableNumber: t.tableNumber, isAvailable: true },
                            { onSettled: () => setTogglingTable(null) }
                          );
                        }
                      }}
                      disabled={togglingTable === t.tableNumber}
                      className={`w-full h-8 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60
                        ${t.isAvailable
                          ? 'bg-slate-500/10 hover:bg-rose-500/15 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                        }`}
                    >
                      {togglingTable === t.tableNumber
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : t.isAvailable
                          ? <><EyeOff className="w-3.5 h-3.5" /> Unlist Table</>
                          : <><Eye className="w-3.5 h-3.5" /> List Table</>
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── ADD TABLE MODAL ──────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080F22] border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <TableProperties className="w-5 h-5 text-purple-400" />
                Add New Table
              </h3>
              <button onClick={handleCloseModal} disabled={addTableMutation.isPending}
                className="text-slate-500 hover:text-white transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddTable} className="p-6 space-y-4">

              {/* Row 1: Table Number + Capacity */}
              <div className="grid grid-cols-2 gap-4">
                {field('Table Number',
                  <input
                    type="text"
                    value={form.tableNumber}
                    onChange={(e) => setForm((f) => ({ ...f, tableNumber: e.target.value }))}
                    placeholder="e.g. T-01, F-05, B-12"
                    required autoFocus
                    disabled={addTableMutation.isPending}
                    className={inputCls}
                  />
                )}
                {field('Capacity',
                  <input
                    type="number"
                    min={1} max={50}
                    value={form.capacity}
                    onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                    placeholder="4"
                    required
                    disabled={addTableMutation.isPending}
                    className={inputCls}
                  />
                )}
              </div>

              {/* Row 2: Table Type + Seating Category */}
              <div className="grid grid-cols-2 gap-4">
                {field('Table Type',
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TableType }))}
                    disabled={addTableMutation.isPending}
                    className={inputCls}
                  >
                    {TABLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                )}
                {field('Seating Category',
                  <select
                    value={form.seatingCategory}
                    onChange={(e) => setForm((f) => ({ ...f, seatingCategory: e.target.value as SeatingCategory }))}
                    disabled={addTableMutation.isPending}
                    className={inputCls}
                  >
                    {SEATING_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status note */}
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  Status is set to <span className="font-bold">Available</span> automatically when a table is added.
                </p>
              </div>

              {/* Description */}
              {field('Description', 
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Near window, AC section, Quiet corner…"
                  disabled={addTableMutation.isPending}
                  className={inputCls}
                />,
                '(optional)'
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseModal} disabled={addTableMutation.isPending}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={addTableMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-colors disabled:opacity-70 flex items-center gap-2">
                  {addTableMutation.isPending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding…</>
                    : <><Plus className="w-3.5 h-3.5" /> Add Table</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT TABLE MODAL ─────────────────────────────────────────────────── */}
      {editingTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080F22] border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-400" />
                Edit Table <span className="text-purple-400">{editingTable.tableNumber}</span>
              </h3>
              <button onClick={handleCloseEdit} disabled={updateTableMutation.isPending}
                className="text-slate-500 hover:text-white transition-colors disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">

              {/* Capacity + Type */}
              <div className="grid grid-cols-2 gap-4">
                {field('Capacity',
                  <input
                    type="number"
                    min={1} max={50}
                    value={editForm.capacity}
                    onChange={(e) => setEditForm((f) => ({ ...f, capacity: parseInt(e.target.value, 10) || 1 }))}
                    required
                    disabled={updateTableMutation.isPending}
                    className={inputCls}
                  />
                )}
                {field('Table Type',
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value as TableType }))}
                    disabled={updateTableMutation.isPending}
                    className={inputCls}
                  >
                    {TABLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Seating Category */}
              {field('Seating Category',
                <select
                  value={editForm.seatingCategory}
                  onChange={(e) => setEditForm((f) => ({ ...f, seatingCategory: e.target.value as SeatingCategory }))}
                  disabled={updateTableMutation.isPending}
                  className={inputCls}
                >
                  {SEATING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              )}

              {/* Description */}
              {field('Description',
                <input
                  type="text"
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Near window, AC section, Quiet corner…"
                  disabled={updateTableMutation.isPending}
                  className={inputCls}
                />,
                '(optional)'
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={handleCloseEdit} disabled={updateTableMutation.isPending}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={updateTableMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-colors disabled:opacity-70 flex items-center gap-2">
                  {updateTableMutation.isPending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                    : <><Pencil className="w-3.5 h-3.5" /> Save Changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UNLIST CONFIRMATION MODAL ────────────────────────────────────────── */}
      {confirmUnlistTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#080F22] border border-slate-800 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">

            {/* Icon + header */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <EyeOff className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Unlist Table {confirmUnlistTable}?</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
                  This table will be hidden from guest bookings and marked as unavailable until you list it again.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-800 mx-6" />

            {/* Actions */}
            <div className="flex gap-3 p-5">
              <button
                onClick={() => setConfirmUnlistTable(null)}
                disabled={togglingTable === confirmUnlistTable}
                className="flex-1 h-10 rounded-xl border border-slate-700 text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const tableNumber = confirmUnlistTable;
                  setConfirmUnlistTable(null);
                  setTogglingTable(tableNumber);
                  toggleAvailabilityMutation.mutate(
                    { tableNumber, isAvailable: false },
                    { onSettled: () => setTogglingTable(null) }
                  );
                }}
                disabled={togglingTable === confirmUnlistTable}
                className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {togglingTable === confirmUnlistTable
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <><EyeOff className="w-4 h-4" /> Yes, Unlist</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TABLE QR MODAL ─────────────────────────────────────────────────── */}
      {selectedQRTable && (
        <TableQRModal
          isOpen={!!selectedQRTable}
          onClose={() => setSelectedQRTable(null)}
          table={selectedQRTable}
          branch={{
            _id: myBranch?._id,
            name: myBranch?.name || `${restaurant?.name || 'Paragon'} — Downtown Branch`,
            code: myBranch?.code || 'BR-NY-01',
          }}
          restaurantName={restaurant?.name || 'Paragon'}
        />
      )}

      {/* ── BULK PRINT STANDEES MODAL ────────────────────────────────────────── */}
      {showBulkPrintModal && (
        <BulkPrintStandeesModal
          isOpen={showBulkPrintModal}
          onClose={() => setShowBulkPrintModal(false)}
          branch={{
            _id: myBranch?._id,
            name: myBranch?.name || `${restaurant?.name || 'Paragon'} — Downtown Branch`,
            code: myBranch?.code || 'BR-NY-01',
          }}
          restaurantName={restaurant?.name || 'Paragon'}
          tables={apiTables}
        />
      )}
    </div>
  );
}
