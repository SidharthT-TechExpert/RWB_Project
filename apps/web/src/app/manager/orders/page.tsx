'use client';

import React, { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { useCurrentBranch } from '@/hooks/useBranches';
import toast from 'react-hot-toast';
import {
  UtensilsCrossed,
  CookingPot,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Flame,
  User,
  ShoppingBag,
  Bell,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Eye,
  Maximize,
  Minimize,
  Tv
} from 'lucide-react';

interface OrderItem {
  id: string;
  orderNo: string;
  table: string;
  customer: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'pending' | 'cooking' | 'ready' | 'served';
  elapsedMins: number;
  specialInstructions?: string;
  time: string;
}

const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'o1',
    orderNo: '#ORD-901',
    table: 'Table 04 (Main Hall)',
    customer: 'Rohan Sharma',
    items: [
      { name: 'Truffle Mushroom Risotto', qty: 2, price: 450 },
      { name: 'Garlic Butter Naan', qty: 4, price: 60 }
    ],
    total: 1140,
    status: 'pending',
    elapsedMins: 3,
    time: '13:42',
    specialInstructions: 'Make Risotto extra creamy. No parsley garnish.'
  },
  {
    id: 'o2',
    orderNo: '#ORD-902',
    table: 'Table 12 (Patio)',
    customer: 'Ananya Verma',
    items: [
      { name: 'Wood-Fired Margherita Pizza', qty: 1, price: 380 },
      { name: 'Artisanal Cold Brew', qty: 2, price: 180 }
    ],
    total: 740,
    status: 'cooking',
    elapsedMins: 14,
    time: '13:30',
    specialInstructions: 'Crispy crust on pizza please.'
  },
  {
    id: 'o3',
    orderNo: '#ORD-903',
    table: 'Table 08 (VIP Lounge)',
    customer: 'Vikram Singh',
    items: [
      { name: 'Grilled Angus Ribeye Steak', qty: 2, price: 890 },
      { name: 'Belgian Chocolate Fondant', qty: 2, price: 290 }
    ],
    total: 2360,
    status: 'ready',
    elapsedMins: 22,
    time: '13:22'
  },
  {
    id: 'o4',
    orderNo: '#ORD-904',
    table: 'Table 01 (Main Hall)',
    customer: 'Neha Patel',
    items: [
      { name: 'Smoked Salmon Carpaccio', qty: 1, price: 520 },
      { name: 'Fresh Lime Soda', qty: 2, price: 120 }
    ],
    total: 760,
    status: 'pending',
    elapsedMins: 1,
    time: '13:44'
  },
  {
    id: 'o5',
    orderNo: '#ORD-905',
    table: 'Table 06 (Patio)',
    customer: 'Kabir Mehta',
    items: [
      { name: 'Truffle Mushroom Risotto', qty: 1, price: 450 },
      { name: 'Belgian Chocolate Fondant', qty: 1, price: 290 }
    ],
    total: 740,
    status: 'served',
    elapsedMins: 35,
    time: '13:10'
  }
];

export default function ManagerOrdersPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [filter, setFilter] = useState<'all' | 'pending' | 'cooking' | 'ready' | 'served'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // New POS Order Modal
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newTable, setNewTable] = useState('Table 02');
  const [newCustomer, setNewCustomer] = useState('');
  const [newDishName, setNewDishName] = useState('Wood-Fired Margherita Pizza');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(380);

  const updateStatus = (id: string, nextStatus: OrderItem['status']) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const statusLabels = {
            pending: 'New Received',
            cooking: 'In Kitchen (Cooking)',
            ready: 'Ready for Pickup / Serve',
            served: 'Served & Completed'
          };
          toast.success(`Order ${o.orderNo} moved to ${statusLabels[nextStatus]}`);
          return { ...o, status: nextStatus };
        }
        return o;
      })
    );
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.trim()) {
      toast.error('Enter guest name for walk-in order');
      return;
    }

    const created: OrderItem = {
      id: `o_${Date.now()}`,
      orderNo: `#ORD-${Math.floor(100 + Math.random() * 900)}`,
      table: newTable,
      customer: newCustomer.trim(),
      items: [{ name: newDishName, qty: newQty, price: newPrice }],
      total: newQty * newPrice,
      status: 'pending',
      elapsedMins: 0,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    setOrders((prev) => [created, ...prev]);
    toast.success(`POS Order ${created.orderNo} sent to Kitchen! 🍳`);
    setNewCustomer('');
    setShowNewOrderModal(false);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch =
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.table.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const cookingCount = orders.filter((o) => o.status === 'cooking').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const servedCount = orders.filter((o) => o.status === 'served').length;

  const [isTvMode, setIsTvMode] = useState(false);

  const toggleTvMode = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsTvMode(true);
      toast.success('📺 TV Kitchen Display Mode Enabled');
    } else {
      document.exitFullscreen().catch(() => {});
      setIsTvMode(false);
      toast.success('Exited TV Mode');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#030816] text-slate-100 min-h-screen">
      {!isTvMode && <ManagerHeader pageTitle="Live Orders & Kitchen Display (KDS)" />}

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-[2400px] w-full mx-auto pb-24">
        {/* Page Title & Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#070D1F] p-4 sm:p-6 rounded-2xl border border-white/8 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase">
                {branchName}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400 font-medium">Real-time KDS Stream</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <CookingPot className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse shrink-0" />
              Live Orders &amp; Kitchen Display (KDS)
            </h1>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTvMode}
              className="px-3.5 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
              title="Toggle Fullscreen Kitchen Display TV Mode"
            >
              {isTvMode ? <Minimize className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
              <span>{isTvMode ? 'Exit TV Mode' : 'TV Screen Mode'}</span>
            </button>

            <button
              onClick={() => setShowNewOrderModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex-1 sm:flex-initial justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>New Walk-in Order</span>
            </button>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-[#080F22]/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'pending', label: 'New Received', count: pendingCount, color: 'text-amber-400' },
              { id: 'cooking', label: 'In Kitchen', count: cookingCount, color: 'text-blue-400' },
              { id: 'ready', label: 'Ready to Serve', count: readyCount, color: 'text-emerald-400' },
              { id: 'served', label: 'Served', count: servedCount, color: 'text-slate-400' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilter(st.id as any)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shrink-0 ${
                  filter === st.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/4 border border-white/6 text-slate-400 hover:text-white'
                }`}
              >
                <span>{st.label}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10">
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative shrink-0 w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, table, guest…"
              className="w-full bg-[#030816] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* KDS Kanban 4-Column Board - Responsive for Mobile, Tablet, 2K/4K/TV */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 3xl:grid-cols-4 gap-4 sm:gap-5">
          {/* Column 1: New Received */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-xs text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                <Clock className="w-4 h-4" /> New Received ({pendingCount})
              </h3>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>

            <div className="space-y-3">
              {filteredOrders.filter((o) => o.status === 'pending').map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-3 shadow-lg relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-400 text-sm">{o.orderNo}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {o.table}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5 border-y border-amber-500/20 py-2.5">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-semibold">
                        <span>{item.name}</span>
                        <span className="font-mono font-black text-white">x{item.qty}</span>
                      </div>
                    ))}
                    {o.specialInstructions && (
                      <p className="text-[11px] text-amber-300/90 italic pt-1">
                        &quot;{o.specialInstructions}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{o.elapsedMins}m elapsed</span>
                    <span className="font-black text-white">₹{o.total}</span>
                  </div>

                  <button
                    onClick={() => updateStatus(o.id, 'cooking')}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <CookingPot className="w-3.5 h-3.5" />
                    <span>Send to Kitchen</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: In Preparation */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-xs text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                <CookingPot className="w-4 h-4" /> In Preparation ({cookingCount})
              </h3>
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {filteredOrders.filter((o) => o.status === 'cooking').map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/30 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-blue-400 text-sm">{o.orderNo}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {o.table}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5 border-y border-blue-500/20 py-2.5">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-semibold">
                        <span>{item.name}</span>
                        <span className="font-mono font-black text-white">x{item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className={o.elapsedMins > 15 ? 'text-rose-400 font-bold' : ''}>
                      {o.elapsedMins}m in prep
                    </span>
                    <span className="font-black text-white">₹{o.total}</span>
                  </div>

                  <button
                    onClick={() => updateStatus(o.id, 'ready')}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Ready for Pickup</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Ready to Serve */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-xs text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Ready to Serve ({readyCount})
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>

            <div className="space-y-3">
              {filteredOrders.filter((o) => o.status === 'ready').map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/30 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-emerald-400 text-sm">{o.orderNo}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {o.table}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5 border-y border-emerald-500/20 py-2.5">
                    {o.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between font-semibold">
                        <span>{item.name}</span>
                        <span className="font-mono font-black text-white">x{item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>{o.customer}</span>
                    <span className="font-black text-white">₹{o.total}</span>
                  </div>

                  <button
                    onClick={() => updateStatus(o.id, 'served')}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                    <span>Serve &amp; Complete Order</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Served / Completed */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-xs text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4" /> Served ({servedCount})
              </h3>
            </div>

            <div className="space-y-3">
              {filteredOrders.filter((o) => o.status === 'served').map((o) => (
                <div
                  key={o.id}
                  className="p-4 rounded-xl bg-white/2 border border-white/6 space-y-2 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-300 text-xs">{o.orderNo}</span>
                    <span className="text-[10px] font-mono text-slate-500">{o.table}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between font-medium">
                    <span>{o.customer}</span>
                    <span className="font-bold text-slate-300">₹{o.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* POS Walk-in Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                New Walk-in Order (POS)
              </h3>
              <button onClick={() => setShowNewOrderModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Guest Name</label>
                <input
                  type="text"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  placeholder="e.g. Vikramaditya"
                  required
                  autoFocus
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Seating Table</label>
                <select
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Table 01 (Main Hall)">Table 01 (Main Hall)</option>
                  <option value="Table 02 (Main Hall)">Table 02 (Main Hall)</option>
                  <option value="Table 05 (Patio)">Table 05 (Patio)</option>
                  <option value="Table 09 (VIP Lounge)">Table 09 (VIP Lounge)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Select Dish</label>
                <select
                  value={newDishName}
                  onChange={(e) => {
                    setNewDishName(e.target.value);
                    if (e.target.value.includes('Risotto')) setNewPrice(450);
                    else if (e.target.value.includes('Steak')) setNewPrice(890);
                    else setNewPrice(380);
                  }}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                >
                  <option value="Wood-Fired Margherita Pizza">Wood-Fired Margherita Pizza (₹380)</option>
                  <option value="Truffle Mushroom Risotto">Truffle Mushroom Risotto (₹450)</option>
                  <option value="Grilled Angus Ribeye Steak">Grilled Angus Ribeye Steak (₹890)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Quantity</label>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Total Amount</label>
                  <div className="w-full bg-white/4 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-black text-emerald-400 font-mono">
                    ₹{newQty * newPrice}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
                >
                  Send to Kitchen KDS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
