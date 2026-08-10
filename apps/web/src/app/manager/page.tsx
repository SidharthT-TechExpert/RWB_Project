'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Plus,
  CookingPot,
  Sparkles,
  ArrowUpRight,
  Check,
  X,
  Building2,
  Printer,
  Receipt,
  UserPlus,
  Flame,
  FileText,
  Eye,
  Coffee
} from 'lucide-react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCurrentBranch } from '@/hooks/useBranches';
import toast from 'react-hot-toast';

interface OrderItemDetail {
  name: string;
  qty: number;
  price: number;
  note?: string;
}

interface LiveOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  items: OrderItemDetail[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  timeAgo: string;
}

interface TableStatus {
  tableNo: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  guestName?: string;
}

export default function ManagerDashboardPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [orders, setOrders] = useState<LiveOrder[]>([
    {
      id: '1',
      orderNumber: '#ORD-1089',
      tableNumber: 'Table 04',
      customerName: 'Rohan Sharma',
      items: [
        { name: 'Butter Chicken (Full)', qty: 2, price: 18.0, note: 'Medium Spicy' },
        { name: 'Garlic Naan', qty: 4, price: 3.5 },
        { name: 'Mango Lassi', qty: 2, price: 4.5 },
      ],
      totalAmount: 48.5,
      status: 'pending',
      timeAgo: '2m ago',
    },
    {
      id: '2',
      orderNumber: '#ORD-1088',
      tableNumber: 'Table 12',
      customerName: 'Ananya Verma',
      items: [
        { name: 'Paneer Tikka Platter', qty: 1, price: 17.0, note: 'Extra Green Chutney' },
        { name: 'Fresh Lime Soda', qty: 2, price: 4.5 },
      ],
      totalAmount: 26.0,
      status: 'preparing',
      timeAgo: '8m ago',
    },
    {
      id: '3',
      orderNumber: '#ORD-1087',
      tableNumber: 'Table 08',
      customerName: 'Vikram Singh',
      items: [
        { name: 'Chicken Dum Biryani', qty: 2, price: 24.0 },
        { name: 'Mirchi Ka Salan', qty: 1, price: 8.0 },
        { name: 'Gulab Jamun (2 pcs)', qty: 2, price: 8.0 },
      ],
      totalAmount: 72.0,
      status: 'preparing',
      timeAgo: '14m ago',
    },
    {
      id: '4',
      orderNumber: '#ORD-1086',
      tableNumber: 'Table 01',
      customerName: 'Neha Patel',
      items: [
        { name: 'Dal Makhani', qty: 1, price: 14.2 },
        { name: 'Jeera Rice', qty: 2, price: 5.0 },
        { name: 'Tandoori Roti', qty: 4, price: 2.5 },
      ],
      totalAmount: 34.2,
      status: 'ready',
      timeAgo: '20m ago',
    },
  ]);

  const [tables, setTables] = useState<TableStatus[]>([
    { tableNo: 1, seats: 2, status: 'occupied', guestName: 'Neha Patel' },
    { tableNo: 2, seats: 4, status: 'available' },
    { tableNo: 3, seats: 4, status: 'reserved', guestName: 'Rahul M.' },
    { tableNo: 4, seats: 6, status: 'occupied', guestName: 'Rohan Sharma' },
    { tableNo: 5, seats: 2, status: 'cleaning' },
    { tableNo: 6, seats: 4, status: 'available' },
    { tableNo: 7, seats: 8, status: 'reserved', guestName: 'Corporate Dinner' },
    { tableNo: 8, seats: 4, status: 'occupied', guestName: 'Vikram Singh' },
  ]);

  // Modal States
  const [isWalkinOpen, setIsWalkinOpen] = useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<LiveOrder | null>(null);
  const [selectedTableForAction, setSelectedTableForAction] = useState<TableStatus | null>(null);

  // Form State for Walkin
  const [walkinForm, setWalkinForm] = useState({
    guestName: '',
    guestsCount: 2,
    tableNo: 2,
  });

  const updateOrderStatus = (orderId: string, nextStatus: LiveOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    toast.success(`Order status updated to ${nextStatus.toUpperCase()}`);
    if (selectedOrderForDetail?.id === orderId) {
      setSelectedOrderForDetail((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTables((prev) =>
      prev.map((t) =>
        t.tableNo === Number(walkinForm.tableNo)
          ? { ...t, status: 'occupied', guestName: walkinForm.guestName || 'Walk-in Guest' }
          : t
      )
    );
    toast.success(`🎉 Table T-0${walkinForm.tableNo} checked in for ${walkinForm.guestName || 'Walk-in Guest'}!`);
    setIsWalkinOpen(false);
    setWalkinForm({ guestName: '', guestsCount: 2, tableNo: 2 });
  };

  const handleTableStatusChange = (tableNo: number, status: TableStatus['status'], guestName?: string) => {
    setTables((prev) =>
      prev.map((t) => (t.tableNo === tableNo ? { ...t, status, guestName: guestName ?? t.guestName } : t))
    );
    toast.success(`Table T-0${tableNo} status changed to ${status.toUpperCase()}`);
    setSelectedTableForAction(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#030816]">
      <ManagerHeader pageTitle="Branch Command Center & Live Operations" />

      <main className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[2400px] w-full mx-auto pb-24">
        {/* Welcome Banner */}
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/20 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-400 text-xs font-mono font-bold">
                {branchName}
              </span>
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Operations Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5">Welcome back, Manager 👋</h2>
            <p className="text-xs text-slate-400 mt-1">
              Monitor outlet performance, kitchen preparation queues, live seating, and staff rosters in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setIsWalkinOpen(true)}
              className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Walk-in Table</span>
            </Button>

            <Button
              onClick={() => toast.success('🔥 Kitchen Rush Mode Activated!')}
              variant="outline"
              className="h-10 px-4 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold text-xs rounded-xl gap-2 cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Rush Mode</span>
            </Button>
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setIsWalkinOpen(true)}
            className="p-3.5 rounded-2xl bg-[#060C1E] border border-white/8 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <UserPlus className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">Walk-in Seating</p>
            <p className="text-[10px] text-slate-400">Assign guest table</p>
          </button>

          <button
            onClick={() => toast.success('POS Direct Order Mode Opened')}
            className="p-3.5 rounded-2xl bg-[#060C1E] border border-white/8 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">POS Direct Order</p>
            <p className="text-[10px] text-slate-400">Take table order</p>
          </button>

          <button
            onClick={() => toast.success('📢 Kitchen Notified for Priority Orders')}
            className="p-3.5 rounded-2xl bg-[#060C1E] border border-white/8 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <CookingPot className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">Kitchen Alert</p>
            <p className="text-[10px] text-slate-400">Notify head chef</p>
          </button>

          <button
            onClick={() => toast.success('📊 Shift Sales Summary Report Generated')}
            className="p-3.5 rounded-2xl bg-[#060C1E] border border-white/8 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-white">Shift Summary</p>
            <p className="text-[10px] text-slate-400">Print daily report</p>
          </button>
        </div>

        {/* KPI Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-white/8 bg-[#070D1F]/90 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Today's Outlet Sales</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">$1,840.50</p>
            <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs yesterday
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/8 bg-[#070D1F]/90 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Active Live Orders</span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Utensils className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">{orders.length} Orders</p>
            <p className="text-[11px] text-blue-400 font-bold flex items-center gap-1">
              <CookingPot className="w-3.5 h-3.5" /> {orders.filter(o => o.status === 'preparing').length} Orders in Kitchen Queue
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/8 bg-[#070D1F]/90 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Table Occupancy</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">75% (18/24)</p>
            <p className="text-[11px] text-purple-400 font-bold flex items-center gap-1">
              {tables.filter(t => t.status === 'available').length} Tables Available right now
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/8 bg-[#070D1F]/90 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Outlet Staff On Duty</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white">8 On Shift</p>
            <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
              4 Waiters, 3 Chefs, 1 Cashier
            </p>
          </div>
        </div>

        {/* Grid Section: Live Orders (KDS) + Live Table Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Live Kitchen Display Feed */}
          <div className="lg:col-span-7 p-6 rounded-2xl border border-white/8 bg-[#060C1E]/90 backdrop-blur-xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <CookingPot className="w-5 h-5 text-blue-400" /> Live Kitchen Orders Queue
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status tracking for kitchen display system</p>
              </div>

              <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs font-mono">
                {orders.filter((o) => o.status !== 'served').length} Active
              </span>
            </div>

            <div className="space-y-3">
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-white/4 border border-white/6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">{o.orderNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-300">
                        {o.tableNumber}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{o.timeAgo}</span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      Guest: <span className="text-white font-bold">{o.customerName}</span> &bull; {o.items.length} items (${o.totalAmount.toFixed(2)})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedOrderForDetail(o)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10 cursor-pointer"
                      title="View Order Details"
                    >
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>

                    {o.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(o.id, 'preparing')}
                        className="h-8 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg gap-1"
                      >
                        <CookingPot className="w-3.5 h-3.5" /> Start Preparing
                      </Button>
                    )}

                    {o.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(o.id, 'ready')}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                      </Button>
                    )}

                    {o.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(o.id, 'served')}
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Serve Table
                      </Button>
                    )}

                    {o.status === 'served' && (
                      <Badge variant="success" className="px-3 py-1 rounded-lg text-xs font-bold">
                        Served & Completed
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Outlet Table Status Layout */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-white/8 bg-[#060C1E]/90 backdrop-blur-xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div>
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" /> Outlet Floor Table Map
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Click any table to manage seating or bill</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {tables.map((t) => {
                const isOccupied = t.status === 'occupied';
                const isReserved = t.status === 'reserved';
                const isCleaning = t.status === 'cleaning';

                return (
                  <button
                    key={t.tableNo}
                    onClick={() => setSelectedTableForAction(t)}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all text-left cursor-pointer hover:scale-[1.02] ${
                      isOccupied
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:border-rose-500/60'
                        : isReserved
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-500/60'
                        : isCleaning
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:border-purple-500/60'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">T-0{t.tableNo}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                        {t.seats} Seats
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-mono font-bold capitalize">{t.status}</p>
                      {t.guestName && (
                        <p className="text-xs font-bold text-white truncate mt-0.5">{t.guestName}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* New Walk-in Modal */}
      <AnimatePresence>
        {isWalkinOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="font-black text-lg text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" /> New Walk-in Guest Check-in
                </h2>
                <button onClick={() => setIsWalkinOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWalkinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Guest Name / Host</label>
                  <input
                    required
                    value={walkinForm.guestName}
                    onChange={(e) => setWalkinForm({ ...walkinForm, guestName: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Party Size (Guests)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={walkinForm.guestsCount}
                      onChange={(e) => setWalkinForm({ ...walkinForm, guestsCount: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300">Assign Available Table</label>
                    <select
                      value={walkinForm.tableNo}
                      onChange={(e) => setWalkinForm({ ...walkinForm, tableNo: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-800 bg-[#060D1E] text-white focus:border-blue-500 outline-none font-bold"
                    >
                      {tables.filter(t => t.status === 'available').map(t => (
                        <option key={t.tableNo} value={t.tableNo}>
                          Table T-0{t.tableNo} ({t.seats} Seats)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button type="button" variant="outline" onClick={() => setIsWalkinOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                    Confirm Seating
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrderForDetail && (
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
                    <CookingPot className="w-5 h-5 text-blue-400" /> Order {selectedOrderForDetail.orderNumber}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedOrderForDetail.tableNumber} &bull; Guest: {selectedOrderForDetail.customerName}</p>
                </div>
                <button onClick={() => setSelectedOrderForDetail(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/4 border border-white/6 space-y-2">
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">Ordered Dishes</p>
                  {selectedOrderForDetail.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                      <div>
                        <span className="font-bold text-white">{item.name}</span>
                        {item.note && <span className="block text-[10px] text-amber-400 italic">Note: {item.note}</span>}
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-300">x{item.qty}</span>
                        <span className="block text-xs font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center px-2 text-sm font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${selectedOrderForDetail.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success('🖨️ KDS Kitchen Docket Printed!')}
                  className="gap-1.5 border-white/10 text-slate-300"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Docket
                </Button>

                <Button
                  size="sm"
                  onClick={() => setSelectedOrderForDetail(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table Action Modal */}
      <AnimatePresence>
        {selectedTableForAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A1227] text-slate-100 w-full max-w-sm rounded-2xl border border-slate-800 p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="font-black text-lg text-white">Table T-0{selectedTableForAction.tableNo}</h2>
                  <p className="text-xs text-slate-400">{selectedTableForAction.seats} Seats &bull; Current: <span className="capitalize font-bold text-white">{selectedTableForAction.status}</span></p>
                </div>
                <button onClick={() => setSelectedTableForAction(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Set Table Status:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTableStatusChange(selectedTableForAction.tableNo, 'available')}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs"
                  >
                    Available
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTableStatusChange(selectedTableForAction.tableNo, 'occupied')}
                    className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs"
                  >
                    Occupied
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTableStatusChange(selectedTableForAction.tableNo, 'reserved')}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 font-bold text-xs"
                  >
                    Reserved
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTableStatusChange(selectedTableForAction.tableNo, 'cleaning')}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold text-xs"
                  >
                    Cleaning
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
