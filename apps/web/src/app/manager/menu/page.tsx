'use client';

import React, { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { useCurrentBranch } from '@/hooks/useBranches';
import toast from 'react-hot-toast';
import {
  Layers,
  UtensilsCrossed,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  DollarSign,
  Tag,
  Flame,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

interface PortionVariant {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number; // base price (or starting price)
  prepTimeMinutes: number;
  isAvailable: boolean;
  isVeg: boolean;
  description: string;
  ordersToday: number;
  rating: number;
  hasPortions?: boolean;
  portions?: PortionVariant[];
}

const INITIAL_CATEGORIES = [
  'All Items',
  'Appetizers',
  'Main Course',
  'Specialty Pizzas',
  'Desserts',
  'Beverages',
  'Chef Specials'
];

const INITIAL_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Royal Chicken Biryani',
    category: 'Main Course',
    price: 180,
    prepTimeMinutes: 20,
    isAvailable: true,
    isVeg: false,
    description: 'Aromatic basmati rice cooked with tender chicken, saffron & authentic spices.',
    ordersToday: 64,
    rating: 4.9,
    hasPortions: true,
    portions: [
      { name: 'Quarter', price: 180 },
      { name: 'Half', price: 320 },
      { name: 'Full', price: 580 },
    ],
  },
  {
    id: 'm2',
    name: 'Wood-Fired Margherita Pizza',
    category: 'Specialty Pizzas',
    price: 280,
    prepTimeMinutes: 15,
    isAvailable: true,
    isVeg: true,
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, basil & extra virgin olive oil.',
    ordersToday: 42,
    rating: 4.8,
    hasPortions: true,
    portions: [
      { name: 'Small (8")', price: 280 },
      { name: 'Medium (11")', price: 420 },
      { name: 'Large (14")', price: 590 },
    ],
  },
  {
    id: 'm3',
    name: 'Smoked Salmon Carpaccio',
    category: 'Appetizers',
    price: 520,
    prepTimeMinutes: 12,
    isAvailable: true,
    isVeg: false,
    description: 'Thinly sliced cured salmon with capers, red onion & lemon-dill vinaigrette.',
    ordersToday: 18,
    rating: 4.7,
    hasPortions: false,
    portions: [],
  },
  {
    id: 'm4',
    name: 'Grilled Angus Ribeye Steak',
    category: 'Main Course',
    price: 890,
    prepTimeMinutes: 25,
    isAvailable: false,
    isVeg: false,
    description: '300g prime Angus beef served with garlic herb butter & roasted asparagus.',
    ordersToday: 12,
    rating: 4.9,
    hasPortions: false,
    portions: [],
  },
  {
    id: 'm5',
    name: 'Belgian Dark Chocolate Fondant',
    category: 'Desserts',
    price: 290,
    prepTimeMinutes: 14,
    isAvailable: true,
    isVeg: true,
    description: 'Molten chocolate cake served with Madagascar vanilla bean gelato.',
    ordersToday: 31,
    rating: 4.9,
    hasPortions: false,
    portions: [],
  },
  {
    id: 'm6',
    name: 'Artisanal Cold Brew Coffee',
    category: 'Beverages',
    price: 140,
    prepTimeMinutes: 5,
    isAvailable: true,
    isVeg: true,
    description: '18-hour slow steeped single-origin Ethiopian coffee over crystal ice cubes.',
    ordersToday: 55,
    rating: 4.8,
    hasPortions: true,
    portions: [
      { name: '250 ml', price: 140 },
      { name: '500 ml', price: 240 },
    ],
  },
];

export default function ManagerMenuPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);
  const [selectedCat, setSelectedCat] = useState<string>('All Items');
  const [items, setItems] = useState<MenuItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [showAddCatModal, setShowAddCatModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // New Item Form State
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Appetizers',
    price: '',
    prepTimeMinutes: '15',
    isVeg: true,
    description: '',
    hasPortions: false,
    portions: [
      { name: 'Quarter', price: 0 },
      { name: 'Half', price: 0 },
      { name: 'Full', price: 0 },
    ] as PortionVariant[],
  });

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  // Preset helpers for portions
  const applyPortionPreset = (preset: 'quarter_half_full' | 'small_medium_large' | 'volume') => {
    let presets: PortionVariant[] = [];
    if (preset === 'quarter_half_full') {
      presets = [
        { name: 'Quarter', price: parseFloat(itemForm.price) || 120 },
        { name: 'Half', price: (parseFloat(itemForm.price) || 120) * 1.8 },
        { name: 'Full', price: (parseFloat(itemForm.price) || 120) * 3.2 },
      ];
    } else if (preset === 'small_medium_large') {
      presets = [
        { name: 'Small', price: parseFloat(itemForm.price) || 200 },
        { name: 'Medium', price: (parseFloat(itemForm.price) || 200) * 1.5 },
        { name: 'Large', price: (parseFloat(itemForm.price) || 200) * 2.2 },
      ];
    } else if (preset === 'volume') {
      presets = [
        { name: '250 ml', price: parseFloat(itemForm.price) || 150 },
        { name: '500 ml', price: (parseFloat(itemForm.price) || 150) * 1.8 },
        { name: '1 Litre', price: (parseFloat(itemForm.price) || 150) * 3.0 },
      ];
    }
    setItemForm((prev) => ({ ...prev, hasPortions: true, portions: presets }));
  };

  const updatePortionRow = (index: number, field: 'name' | 'price', val: string) => {
    setItemForm((prev) => {
      const updated = [...prev.portions];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: val };
      } else {
        updated[index] = { ...updated[index], price: parseFloat(val) || 0 };
      }
      return { ...prev, portions: updated };
    });
  };

  const addPortionRow = () => {
    setItemForm((prev) => ({
      ...prev,
      hasPortions: true,
      portions: [...prev.portions, { name: '', price: 0 }],
    }));
  };

  const removePortionRow = (index: number) => {
    setItemForm((prev) => {
      const updated = prev.portions.filter((_, i) => i !== index);
      return { ...prev, portions: updated, hasPortions: updated.length > 0 };
    });
  };

  // Availability Toggle Handler
  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = !item.isAvailable;
          toast.success(
            `${item.name} is now ${updated ? 'IN STOCK' : 'OUT OF STOCK'}`,
            { icon: updated ? '✅' : '🛑' }
          );
          return { ...item, isAvailable: updated };
        }
        return item;
      })
    );
  };

  // Delete Item Handler
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from branch menu?`)) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Removed "${name}" from outlet menu.`);
    }
  };

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      toast.error('Please fill in dish name');
      return;
    }

    const activePortions = itemForm.hasPortions
      ? itemForm.portions.filter((p) => p.name.trim() !== '')
      : [];

    const basePrice = activePortions.length > 0
      ? activePortions[0].price
      : parseFloat(itemForm.price) || 200;

    const created: MenuItem = {
      id: `m_${Date.now()}`,
      name: itemForm.name.trim(),
      category: itemForm.category,
      price: basePrice,
      prepTimeMinutes: parseInt(itemForm.prepTimeMinutes) || 15,
      isAvailable: true,
      isVeg: itemForm.isVeg,
      description: itemForm.description.trim() || 'Freshly prepared branch specialty dish.',
      ordersToday: 0,
      rating: 5.0,
      hasPortions: activePortions.length > 0,
      portions: activePortions,
    };

    setItems((prev) => [created, ...prev]);
    toast.success(`Added "${created.name}" to ${itemForm.category}! 🎉`);

    setItemForm({
      name: '',
      category: 'Appetizers',
      price: '',
      prepTimeMinutes: '15',
      isVeg: true,
      description: '',
      hasPortions: false,
      portions: [
        { name: 'Quarter', price: 0 },
        { name: 'Half', price: 0 },
        { name: 'Full', price: 0 },
      ],
    });
    setShowAddItemModal(false);
  };

  // Edit Item Handler
  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      prepTimeMinutes: item.prepTimeMinutes.toString(),
      isVeg: item.isVeg,
      description: item.description,
      hasPortions: !!(item.hasPortions && item.portions && item.portions.length > 0),
      portions: item.portions && item.portions.length > 0
        ? item.portions
        : [
            { name: 'Quarter', price: 0 },
            { name: 'Half', price: 0 },
            { name: 'Full', price: 0 },
          ],
    });
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (!itemForm.name.trim()) {
      toast.error('Dish name is required');
      return;
    }

    const activePortions = itemForm.hasPortions
      ? itemForm.portions.filter((p) => p.name.trim() !== '')
      : [];

    const basePrice = activePortions.length > 0
      ? activePortions[0].price
      : parseFloat(itemForm.price) || editingItem.price;

    setItems((prev) =>
      prev.map((i) =>
        i.id === editingItem.id
          ? {
              ...i,
              name: itemForm.name.trim(),
              category: itemForm.category,
              price: basePrice,
              prepTimeMinutes: parseInt(itemForm.prepTimeMinutes) || i.prepTimeMinutes,
              isVeg: itemForm.isVeg,
              description: itemForm.description.trim(),
              hasPortions: activePortions.length > 0,
              portions: activePortions,
            }
          : i
      )
    );

    toast.success(`Updated "${itemForm.name}" details! ✨`);
    setEditingItem(null);
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) {
      toast.error('Enter category name');
      return;
    }
    if (categories.map((c) => c.toLowerCase()).includes(cleanName.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }

    setCategories((prev) => [...prev, cleanName]);
    toast.success(`Category "${cleanName}" added!`);
    setNewCatName('');
    setShowAddCatModal(false);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCat === 'All Items' || item.category === selectedCat;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItemsCount = items.length;
  const availableItemsCount = items.filter((i) => i.isAvailable).length;
  const outOfStockCount = totalItemsCount - availableItemsCount;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#030816] text-slate-100 min-h-screen">
      <ManagerHeader pageTitle="Menu & Catalog Management" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[2400px] w-full mx-auto pb-24">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-[#0d1528] to-blue-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.12),transparent_60%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 sm:p-7">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-[0.2em]">OUTLET DISHES &amp; PORTIONS</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Menu &amp; Portion Pricing Management</h1>
              <p className="text-xs text-slate-400 max-w-md">Assign portion pricing (Quarter, Half, Full, Sizes, Volumes), live stock availability, and preparation categories.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowAddCatModal(true)}
                className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs gap-2 flex items-center transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-purple-400" />
                <span>Add Category</span>
              </button>
              <button
                onClick={() => {
                  setItemForm({
                    name: '',
                    category: categories.find(c => c !== 'All Items') || 'Appetizers',
                    price: '',
                    prepTimeMinutes: '15',
                    isVeg: true,
                    description: '',
                    hasPortions: true,
                    portions: [
                      { name: 'Quarter', price: 150 },
                      { name: 'Half', price: 280 },
                      { name: 'Full', price: 500 },
                    ],
                  });
                  setShowAddItemModal(true);
                }}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs gap-2 flex items-center shadow-lg shadow-purple-600/25 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative rounded-2xl bg-purple-500/8 border border-purple-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-purple-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <p className="text-[9px] sm:text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">Total Dishes</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-purple-400 leading-none tabular-nums">{totalItemsCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">across {categories.length - 1} categories</p>
          </div>

          <div className="relative rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] sm:text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">In Stock &amp; Active</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-400 leading-none tabular-nums">{availableItemsCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">ready for guest orders</p>
          </div>

          <div className="relative rounded-2xl bg-rose-500/8 border border-rose-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-rose-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <p className="text-[9px] sm:text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">Out of Stock</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-400 leading-none tabular-nums">{outOfStockCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">temporarily disabled</p>
          </div>
        </div>

        {/* ── Category Filter Pills & Search ── */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-1">
              {categories.map((cat) => {
                const isSelected = selectedCat === cat;
                const count =
                  cat === 'All Items'
                    ? items.length
                    : items.filter((i) => i.category === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-[#080F22]/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative shrink-0 md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish name or description…"
                className="w-full bg-[#080F22]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Dishes List ── */}
        <div className="rounded-2xl bg-[#080E1E]/90 border border-white/8 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <span>Dishes in</span>
              <span className="text-purple-400">{selectedCat}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Showing {filteredItems.length} of {items.length} items
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto text-slate-500">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">No menu items found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your selected category or search query.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-4 h-4 rounded mt-1 shrink-0 flex items-center justify-center border ${
                        item.isVeg
                          ? 'border-emerald-500/80 bg-emerald-500/10'
                          : 'border-rose-500/80 bg-rose-500/10'
                      }`}
                      title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-white tracking-tight">{item.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          ★ {item.rating}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>

                      {/* Portion variants display badge line */}
                      {item.hasPortions && item.portions && item.portions.length > 0 ? (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] font-mono text-purple-400 font-bold">📏 Portions:</span>
                          {item.portions.map((p, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-300">
                              <span>{p.name}:</span>
                              <span className="text-white font-extrabold">₹{p.price}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {item.prepTimeMinutes} mins prep
                          </span>
                          <span>&bull;</span>
                          <span>{item.ordersToday} ordered today</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Controls */}
                  <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">
                        {item.hasPortions ? 'Starts at' : 'Price'}
                      </p>
                      <p className="text-base font-black text-white tabular-nums">₹{item.price}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-8 h-8 rounded-xl bg-white/4 hover:bg-purple-500/15 border border-white/8 hover:border-purple-500/30 text-slate-400 hover:text-purple-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit dish details & portion prices"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                        title="Delete dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: ADD MENU ITEM ── */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-purple-400" />
                Add New Dish to Menu
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Dish / Item Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Special Chicken Biryani"
                  required
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {categories
                      .filter((c) => c !== 'All Items')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Base Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    placeholder="180"
                    required={!itemForm.hasPortions}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* ── Portion / Quantity Options Block ── */}
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-purple-300 uppercase flex items-center gap-1.5">
                    <span>📏 Portion Quantity Pricing</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Quarter, Half, Full)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setItemForm((prev) => ({ ...prev, hasPortions: !prev.hasPortions }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      itemForm.hasPortions
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {itemForm.hasPortions ? 'Enabled' : 'Enable Portions'}
                  </button>
                </div>

                {itemForm.hasPortions && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-slate-400 font-medium">Quick Portion Presets:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('quarter_half_full')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25"
                      >
                        ⚡ Quarter / Half / Full
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('small_medium_large')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/25"
                      >
                        ⚡ Small / Medium / Large
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('volume')}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold hover:bg-teal-500/25"
                      >
                        ⚡ 250ml / 500ml / 1L
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {itemForm.portions.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePortionRow(idx, 'name', e.target.value)}
                            placeholder="Portion Name (e.g. Quarter)"
                            className="flex-1 bg-[#030816] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">₹</span>
                            <input
                              type="number"
                              value={p.price || ''}
                              onChange={(e) => updatePortionRow(idx, 'price', e.target.value)}
                              placeholder="Price"
                              className="w-full bg-[#030816] border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePortionRow(idx)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPortionRow}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Portion Option
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemForm.prepTimeMinutes}
                    onChange={(e) => setItemForm({ ...itemForm, prepTimeMinutes: e.target.value })}
                    placeholder="15"
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Dietary Type</label>
                  <select
                    value={itemForm.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.value === 'veg' })}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="nonveg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Brief ingredients and preparation details…"
                  rows={3}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Add Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT MENU ITEM ── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-400" />
                Edit Dish &amp; Portion Pricing
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Dish Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  required
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    {categories
                      .filter((c) => c !== 'All Items')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Base Price (₹)</label>
                  <input
                    type="number"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                    required={!itemForm.hasPortions}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* ── Portion / Quantity Options Block ── */}
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-purple-300 uppercase flex items-center gap-1.5">
                    <span>📏 Portion Quantity Pricing</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Quarter, Half, Full)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setItemForm((prev) => ({ ...prev, hasPortions: !prev.hasPortions }))}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      itemForm.hasPortions
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    {itemForm.hasPortions ? 'Enabled' : 'Enable Portions'}
                  </button>
                </div>

                {itemForm.hasPortions && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-slate-400 font-medium">Quick Portion Presets:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('quarter_half_full')}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25"
                      >
                        ⚡ Quarter / Half / Full
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('small_medium_large')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/25"
                      >
                        ⚡ Small / Medium / Large
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPortionPreset('volume')}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-bold hover:bg-teal-500/25"
                      >
                        ⚡ 250ml / 500ml / 1L
                      </button>
                    </div>

                    <div className="space-y-2 pt-1">
                      {itemForm.portions.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => updatePortionRow(idx, 'name', e.target.value)}
                            placeholder="Portion Name (e.g. Quarter)"
                            className="flex-1 bg-[#030816] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">₹</span>
                            <input
                              type="number"
                              value={p.price || ''}
                              onChange={(e) => updatePortionRow(idx, 'price', e.target.value)}
                              placeholder="Price"
                              className="w-full bg-[#030816] border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-bold"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePortionRow(idx)}
                            className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={addPortionRow}
                        className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 pt-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Portion Option
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemForm.prepTimeMinutes}
                    onChange={(e) => setItemForm({ ...itemForm, prepTimeMinutes: e.target.value })}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Dietary Type</label>
                  <select
                    value={itemForm.isVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.value === 'veg' })}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="nonveg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CATEGORY ── */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Add New Menu Category
              </h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Mocktails &amp; Shakes"
                  required
                  autoFocus
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

