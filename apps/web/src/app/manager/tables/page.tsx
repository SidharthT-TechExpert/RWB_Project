'use client';

import { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { CalendarCheck, Users, Plus, CheckCircle2, UserPlus, X, TableProperties, Loader2, AlertCircle, EyeOff, Eye, Pencil, QrCode, Printer, Search, Filter, RotateCcw } from 'lucide-react';
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

// Left accent border color for table cards
const STATUS_BORDER_ACCENT: Record<string, string> = {
  available:   'border-l-emerald-500',
  occupied:    'border-l-rose-500',
  reserved:    'border-l-amber-500',
  cleaning:    'border-l-purple-500',
  maintenance: 'border-l-slate-600',
  unlisted:    'border-l-slate-700',
};

const STATUS_GLOW: Record<string, string> = {
  available:   'hover:shadow-emerald-500/10 hover:border-emerald-500/25',
  occupied:    'hover:shadow-rose-500/10 hover:border-rose-500/25',
  reserved:    'hover:shadow-amber-500/10 hover:border-amber-500/25',
  cleaning:    'hover:shadow-purple-500/10 hover:border-purple-500/25',
  maintenance: 'hover:shadow-slate-500/5 hover:border-slate-500/20',
  unlisted:    'hover:shadow-slate-500/5 hover:border-slate-700/40',
};

const CATEGORY_LABELS: Record<SeatingCategory, string> = {
  regular:  'Regular',
  family:   'Family',
  business: 'Business',
  vip:      '⭐ VIP',
  couple:   'Couple',
};

const CATEGORY_COLORS: Record<SeatingCategory, string> = {
  regular:  'bg-slate-500/15 text-slate-400 border border-slate-500/20',
  family:   'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  business: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20',
  vip:      'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  couple:   'bg-pink-500/15 text-pink-400 border border-pink-500/20',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  type: string;
  seatingCategory: string;
  isAc: boolean;
  description?: string;
  status: TableStatus;
  isAvailable: boolean;
}

interface FormState {
  tableNumber: string;
  capacity: string;
  type: TableType;
  seatingCategory: SeatingCategory;
  isAc: boolean;
  description: string;
}

const DEFAULT_FORM: FormState = {
  tableNumber: '',
  capacity: '4',
  type: 'indoor',
  seatingCategory: 'regular',
  isAc: true,
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
  const [editForm, setEditForm] = useState<EditTablePayload & { tableNumber: string }>({ tableNumber: '', capacity: 4, type: 'indoor', seatingCategory: 'regular', isAc: true, description: '' });
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // ── Table Filters State ─────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'occupied' | 'unlisted'>('all');
  const [climateFilter, setClimateFilter] = useState<'all' | 'ac' | 'non_ac'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  // ── Derive tables ───────────────────────────────────────────────────────────

  const apiTables: TableItem[] = (restaurant?.tables ?? []).map((t) => ({
    id: t.tableNumber,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    type: t.type,
    seatingCategory: (t as any).seatingCategory ?? 'regular',
    isAc: (t as any).isAc !== false,
    description: (t as any).description,
    isAvailable: t.isAvailable,
    status: localStatus[t.tableNumber] ?? (t.isAvailable ? 'available' : 'occupied'),
  }));

  const total     = apiTables.length;
  const available = apiTables.filter((t) => t.isAvailable && (localStatus[t.tableNumber] ?? t.status) === 'available').length;
  const occupied  = apiTables.filter((t) => t.isAvailable && (localStatus[t.tableNumber] ?? t.status) === 'occupied').length;
  const unlisted  = apiTables.filter((t) => !t.isAvailable).length;

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    statusFilter !== 'all' ||
    climateFilter !== 'all' ||
    typeFilter !== 'all' ||
    categoryFilter !== 'all' ||
    capacityFilter !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setClimateFilter('all');
    setTypeFilter('all');
    setCategoryFilter('all');
    setCapacityFilter('all');
  };

  const filteredTables = apiTables.filter((t) => {
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const matchNum = t.tableNumber.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchType = t.type.toLowerCase().includes(q);
      const matchCat = (t.seatingCategory || '').toLowerCase().includes(q);
      if (!matchNum && !matchDesc && !matchType && !matchCat) return false;
    }

    // Status filter
    const currentStatus = localStatus[t.tableNumber] ?? (t.isAvailable ? 'available' : 'occupied');
    if (statusFilter === 'available') {
      if (!t.isAvailable || currentStatus !== 'available') return false;
    } else if (statusFilter === 'occupied') {
      if (!t.isAvailable || currentStatus !== 'occupied') return false;
    } else if (statusFilter === 'unlisted') {
      if (t.isAvailable) return false;
    }

    // Climate filter
    if (climateFilter === 'ac' && !t.isAc) return false;
    if (climateFilter === 'non_ac' && t.isAc) return false;

    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    // Category filter
    if (categoryFilter !== 'all' && t.seatingCategory !== categoryFilter) return false;

    // Capacity filter
    if (capacityFilter !== 'all' && t.capacity < parseInt(capacityFilter, 10)) return false;

    return true;
  });

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
      isAc: t.isAc !== false,
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
        isAc: editForm.isAc,
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
      isAc: form.isAc,
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

      <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-[2400px] w-full mx-auto pb-24">

        {/* ── Premium Hero Header Banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-[#0d1528] to-indigo-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.12),transparent_60%)]" />
          {/* Decorative grid dots */}
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)',backgroundSize:'24px 24px'}} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 sm:p-7">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-[0.2em]">FLOOR PLAN</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Seating Roster &amp; Table Control</h2>
              <p className="text-xs text-slate-400 max-w-sm">Manage live table status, guest check-ins, and walk-in assignments in real-time.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setShowBulkPrintModal(true)}
                disabled={apiTables.length === 0}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs gap-2 flex items-center transition-all disabled:opacity-40 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Print Standees</span>
                <span className="sm:hidden">Print</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!restaurantId || isLoading}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold text-xs gap-2 flex items-center transition-all disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Add Table
              </button>
              <button
                onClick={() => toast.success('Walk-in Check-in coming soon')}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-black text-xs gap-2 flex items-center shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Walk-in Check-in</span>
                <span className="sm:hidden">Walk-in</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats — Premium Glassmorphism KPI Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Tables', value: total, sub: `${unlisted} unlisted`,
              colors: { bg: 'bg-purple-500/8', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400', glow: 'shadow-purple-500/10' },
              Icon: TableProperties,
            },
            {
              label: 'Available Now', value: available, sub: 'ready for guests',
              colors: { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', glow: 'shadow-emerald-500/10' },
              Icon: CheckCircle2,
            },
            {
              label: 'Occupied', value: occupied, sub: 'guests seated',
              colors: { bg: 'bg-rose-500/8', border: 'border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400', glow: 'shadow-rose-500/10' },
              Icon: Users,
            },
          ].map(({ label, value, sub, colors, Icon }) => (
            <div key={label} className={`relative rounded-2xl ${colors.bg} border ${colors.border} p-4 sm:p-5 overflow-hidden shadow-lg ${colors.glow} hover:scale-[1.02] transition-transform duration-200`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30" style={{background: 'currentColor'}} />
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                    <p className="text-[9px] sm:text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">{label}</p>
                  </div>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${colors.bg} border ${colors.border} ${colors.text} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
                <p className={`text-3xl sm:text-4xl font-black ${colors.text} leading-none tabular-nums`}>{value}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-1.5">{sub}</p>
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

        {/* ── Filter & Search Toolbar ────────────────────────────────────────── */}
        {!isLoading && apiTables.length > 0 && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#070D1F] border border-white/8 space-y-3.5 shadow-xl">
            {/* Row 1: Search & Quick Status Pills */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full lg:max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search table number, notes, category..."
                  className="w-full bg-[#030816] border border-white/8 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Status Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: `All Tables (${total})` },
                  { id: 'available', label: `Available (${available})` },
                  { id: 'occupied', label: `Occupied (${occupied})` },
                  { id: 'unlisted', label: `Unlisted (${unlisted})` },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      statusFilter === st.id
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-white/4 border border-white/6 text-slate-400 hover:text-white hover:border-white/12'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Dropdowns + Active Count + Reset */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/6 text-xs">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:flex md:flex-wrap items-center gap-2">
                {/* Climate AC Filter */}
                <select
                  value={climateFilter}
                  onChange={(e) => setClimateFilter(e.target.value as any)}
                  className="bg-[#030816] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">❄️ All Climate (AC / Non-AC)</option>
                  <option value="ac">❄️ AC Tables Only</option>
                  <option value="non_ac">🍃 Non-AC Tables Only</option>
                </select>

                {/* Section / Table Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-[#030816] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">🏢 All Sections</option>
                  {TABLE_TYPES.map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>

                {/* Seating Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-[#030816] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">👥 All Categories</option>
                  {SEATING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>

                {/* Min Capacity Filter */}
                <select
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="bg-[#030816] border border-white/8 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-purple-500 cursor-pointer w-full sm:w-auto"
                >
                  <option value="all">🪑 Any Capacity</option>
                  <option value="2">2+ Guests</option>
                  <option value="4">4+ Guests</option>
                  <option value="6">6+ Guests</option>
                  <option value="8">8+ Guests</option>
                </select>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all w-full xs:w-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Result Count Counter */}
              <div className="text-[11px] text-slate-400 font-mono shrink-0">
                Showing <span className="text-white font-bold">{filteredTables.length}</span> of <span className="text-white font-bold">{apiTables.length}</span> tables
              </div>
            </div>
          </div>
        )}

        {/* Empty Filter State */}
        {!isLoading && apiTables.length > 0 && filteredTables.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center bg-[#060C1E] rounded-2xl border border-white/8">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No tables match your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search query, status, or climate filters.</p>
            </div>
            <Button
              onClick={resetFilters}
              variant="outline"
              className="border-white/10 hover:bg-white/6 text-white text-xs font-bold rounded-xl h-9 px-4 mt-2 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Clear All Filters</span>
            </Button>
          </div>
        )}

        {/* Tables Grid - Premium Cards */}
        {!isLoading && filteredTables.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredTables.map((t) => {
              const status: TableStatus = (localStatus[t.tableNumber] ?? t.status) as TableStatus;
              const cat = (t.seatingCategory ?? 'regular') as SeatingCategory;

              // Color config per status
              const cfg = !t.isAvailable ? {
                glow: '',
                topLine: 'bg-slate-700/50',
                headerBg: 'from-slate-800/40 to-transparent',
                numColor: 'text-slate-400',
                badgeBg: 'bg-slate-800/80 border-slate-700/50 text-slate-400',
                cardBg: 'bg-[#080e1e]/60 border-slate-800/60',
              } : status === 'available' ? {
                glow: 'shadow-[0_0_40px_rgba(16,185,129,0.10)] hover:shadow-[0_0_60px_rgba(16,185,129,0.20)]',
                topLine: 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent',
                headerBg: 'from-emerald-900/20 to-transparent',
                numColor: 'text-white',
                badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
                cardBg: 'bg-[#080e1e]/90 border-emerald-500/15 hover:border-emerald-500/30',
              } : status === 'occupied' ? {
                glow: 'shadow-[0_0_40px_rgba(244,63,94,0.10)] hover:shadow-[0_0_60px_rgba(244,63,94,0.20)]',
                topLine: 'bg-gradient-to-r from-transparent via-rose-400 to-transparent',
                headerBg: 'from-rose-900/20 to-transparent',
                numColor: 'text-white',
                badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
                cardBg: 'bg-[#080e1e]/90 border-rose-500/15 hover:border-rose-500/30',
              } : status === 'cleaning' ? {
                glow: 'shadow-[0_0_40px_rgba(168,85,247,0.10)] hover:shadow-[0_0_60px_rgba(168,85,247,0.18)]',
                topLine: 'bg-gradient-to-r from-transparent via-purple-400 to-transparent',
                headerBg: 'from-purple-900/20 to-transparent',
                numColor: 'text-white',
                badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
                cardBg: 'bg-[#080e1e]/90 border-purple-500/15 hover:border-purple-500/30',
              } : {
                glow: 'shadow-[0_0_40px_rgba(245,158,11,0.08)] hover:shadow-[0_0_60px_rgba(245,158,11,0.15)]',
                topLine: 'bg-gradient-to-r from-transparent via-amber-400 to-transparent',
                headerBg: 'from-amber-900/15 to-transparent',
                numColor: 'text-white',
                badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
                cardBg: 'bg-[#080e1e]/90 border-amber-500/15 hover:border-amber-500/30',
              };

              return (
                <div
                  key={t.id}
                  className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 ${cfg.cardBg} ${cfg.glow}`}
                >
                  {/* Top glow line */}
                  <div className={`absolute top-0 inset-x-0 h-[2px] ${cfg.topLine}`} />

                  {/* Header background gradient */}
                  <div className={`absolute top-0 inset-x-0 h-24 bg-gradient-to-b ${cfg.headerBg} pointer-events-none`} />

                  <div className="relative p-5 space-y-4">

                    {/* ── Card Header ── */}
                    <div className={!t.isAvailable ? 'opacity-55' : ''}>
                      <div className="flex items-start justify-between gap-2">
                        {/* Left: Table number + section */}
                        <div>
                          <div className="flex items-baseline gap-2 leading-none">
                            <span className={`text-3xl sm:text-4xl font-black tracking-tighter ${cfg.numColor}`}>{t.tableNumber}</span>
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{t.type}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{t.type} Section</p>
                        </div>

                        {/* Right: Status + action icons */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${cfg.badgeBg}`}>
                            {!t.isAvailable ? (
                              <><EyeOff className="w-2.5 h-2.5" /> Unlisted</>
                            ) : status === 'available' ? (
                              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available</>
                            ) : status === 'occupied' ? (
                              <><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Occupied</>
                            ) : status === 'cleaning' ? (
                              <><span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> Cleaning</>
                            ) : (
                              <span className="capitalize">{status}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedQRTable(t)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/8 hover:border-purple-500/40 text-slate-500 hover:text-purple-400 flex items-center justify-center transition-all cursor-pointer"
                              title="Table QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(t)}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 text-slate-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                              title="Edit Table"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Info Rows ── */}
                    <div className={`rounded-xl border divide-y text-xs overflow-hidden transition-opacity ${!t.isAvailable ? 'opacity-50 bg-white/[0.02] border-white/5 divide-white/[0.04]' : 'bg-white/[0.03] border-white/8 divide-white/[0.06]'}`}>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> Capacity
                        </span>
                        <span className="font-bold text-white">{t.capacity} Guests</span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-slate-500">Category</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>
                          {CATEGORY_LABELS[cat]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-slate-500">Climate</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          t.isAc
                            ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
                            : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        }`}>
                          {t.isAc ? '❄️ AC' : '🌿 Non-AC'}
                        </span>
                      </div>
                      {t.description && (
                        <div className="flex items-center justify-between px-3 py-2.5 gap-3">
                          <span className="text-slate-500 shrink-0">Note</span>
                          <span className="text-slate-300 font-semibold text-right truncate text-[10px]">{t.description}</span>
                        </div>
                      )}
                    </div>

                    {/* ── Action Buttons ── */}
                    {t.isAvailable ? (
                      <div className="space-y-2">
                        {status === 'available' && (
                          <button
                            onClick={() => updateTableStatus(t.id, 'occupied')}
                            className="w-full h-10 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-200 active:scale-[0.98] cursor-pointer tracking-wide"
                          >
                            <Users className="w-3.5 h-3.5" />
                            SEAT GUESTS
                          </button>
                        )}
                        {status === 'occupied' && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => updateTableStatus(t.id, 'available')}
                              className="h-10 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 hover:from-emerald-500/40 hover:to-emerald-400/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-300 transition-all duration-200 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Set Free
                            </button>
                            <button
                              onClick={() => updateTableStatus(t.id, 'cleaning')}
                              className="h-10 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-purple-500/20 hover:from-purple-500/40 hover:to-purple-400/30 border border-purple-500/40 hover:border-purple-400/60 text-purple-300 transition-all duration-200 cursor-pointer"
                            >
                              🧹 Clean
                            </button>
                          </div>
                        )}
                        {status === 'cleaning' && (
                          <button
                            onClick={() => updateTableStatus(t.id, 'available')}
                            className="w-full h-10 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600/30 to-emerald-500/20 hover:from-emerald-500/40 hover:to-emerald-400/30 border border-emerald-500/40 hover:border-emerald-400/60 text-emerald-300 transition-all duration-200 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Clean &amp; Free
                          </button>
                        )}
                        {status === 'reserved' && (
                          <button
                            onClick={() => updateTableStatus(t.id, 'occupied')}
                            className="w-full h-10 rounded-xl text-xs font-black flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600/30 to-amber-500/20 hover:from-amber-500/40 to-amber-400/30 border border-amber-500/40 text-amber-300 transition-all duration-200 cursor-pointer"
                          >
                            Check-in Guest
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <p className="text-[11px] text-slate-600">Unlisted — list it to manage status.</p>
                      </div>
                    )}

                    {/* ── List / Unlist ── */}
                    <div className="pt-0.5">
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
                        className={`w-full h-9 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all duration-200 disabled:opacity-50 cursor-pointer border ${
                          t.isAvailable
                            ? 'bg-transparent border-white/8 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {togglingTable === t.tableNumber
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : t.isAvailable
                            ? <><EyeOff className="w-3 h-3" /> Unlist Table</>
                            : <><Eye className="w-3 h-3" /> Make Available</>
                        }
                      </button>
                    </div>

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

              {/* Row 2: Table Type + Climate / AC */}
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
                {field('Climate / AC',
                  <select
                    value={form.isAc ? 'ac' : 'non-ac'}
                    onChange={(e) => setForm((f) => ({ ...f, isAc: e.target.value === 'ac' }))}
                    disabled={addTableMutation.isPending}
                    className={inputCls}
                  >
                    <option value="ac">❄️ AC (Air Conditioned)</option>
                    <option value="non-ac">🍃 Non-AC</option>
                  </select>
                )}
              </div>

              {/* Row 3: Seating Category */}
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
                  placeholder="e.g. Near window, Quiet corner, Garden view…"
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

              {/* Row 1: Capacity + Table Type */}
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

              {/* Row 2: Climate / AC + Seating Category */}
              <div className="grid grid-cols-2 gap-4">
                {field('Climate / AC',
                  <select
                    value={editForm.isAc ? 'ac' : 'non-ac'}
                    onChange={(e) => setEditForm((f) => ({ ...f, isAc: e.target.value === 'ac' }))}
                    disabled={updateTableMutation.isPending}
                    className={inputCls}
                  >
                    <option value="ac">❄️ AC (Air Conditioned)</option>
                    <option value="non-ac">🍃 Non-AC</option>
                  </select>
                )}
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
              </div>

              {/* Description */}
              {field('Description',
                <input
                  type="text"
                  value={editForm.description ?? ''}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Near window, Quiet corner, Garden view…"
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
