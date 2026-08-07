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

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  isVeg: boolean;
  description: string;
  ordersToday: number;
  rating: number;
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
    name: 'Truffle Mushroom Risotto',
    category: 'Chef Specials',
    price: 450,
    prepTimeMinutes: 18,
    isAvailable: true,
    isVeg: true,
    description: 'Arborio rice cooked with wild forest mushrooms, white truffle oil & parmesan.',
    ordersToday: 24,
    rating: 4.9,
  },
  {
    id: 'm2',
    name: 'Wood-Fired Margherita Pizza',
    category: 'Specialty Pizzas',
    price: 380,
    prepTimeMinutes: 15,
    isAvailable: true,
    isVeg: true,
    description: 'San Marzano tomato sauce, fresh buffalo mozzarella, basil & extra virgin olive oil.',
    ordersToday: 42,
    rating: 4.8,
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
  },
  {
    id: 'm6',
    name: 'Artisanal Cold Brew Coffee',
    category: 'Beverages',
    price: 180,
    prepTimeMinutes: 5,
    isAvailable: true,
    isVeg: true,
    description: '18-hour slow steeped single-origin Ethiopian coffee over crystal ice cubes.',
    ordersToday: 55,
    rating: 4.8,
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
  const [newItemName, setNewItemName] = useState('');
  const [newItemCat, setNewItemCat] = useState('Appetizers');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemPrepTime, setNewItemPrepTime] = useState('15');
  const [newItemIsVeg, setNewItemIsVeg] = useState(true);
  const [newItemDesc, setNewItemDesc] = useState('');

  // New Category State
  const [newCatName, setNewCatName] = useState('');

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
    if (!newItemName.trim() || !newItemPrice.trim()) {
      toast.error('Please fill in dish name and price');
      return;
    }

    const created: MenuItem = {
      id: `m_${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCat,
      price: parseFloat(newItemPrice) || 200,
      prepTimeMinutes: parseInt(newItemPrepTime) || 15,
      isAvailable: true,
      isVeg: newItemIsVeg,
      description: newItemDesc.trim() || 'Freshly prepared branch specialty dish.',
      ordersToday: 0,
      rating: 5.0,
    };

    setItems((prev) => [created, ...prev]);
    toast.success(`Added "${created.name}" to ${newItemCat}! 🎉`);

    // Reset Form
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setShowAddItemModal(false);
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
      <ManagerHeader />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase">
                {branchName}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400 font-medium">Menu Catalog & Availability</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-400" />
              Menu &amp; Category Manager
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddCatModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>Add Category</span>
            </button>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Total Menu Items</p>
              <p className="text-2xl font-black text-white mt-1 tabular-nums">{totalItemsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">In Stock &amp; Active</p>
              <p className="text-2xl font-black text-emerald-400 mt-1 tabular-nums">{availableItemsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#080F22]/90 border border-slate-800/80 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Out of Stock</p>
              <p className="text-2xl font-black text-rose-400 mt-1 tabular-nums">{outOfStockCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-[#080F22]/90 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish or category…"
                className="w-full bg-[#080F22]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Menu Items Table / Grid */}
        <div className="rounded-2xl bg-[#080F22]/90 border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Items in</span>
              <span className="text-blue-400">{selectedCat}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Showing {filteredItems.length} of {items.length} dishes
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto text-slate-500">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-300">No dishes found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No items match your filter criteria or search query. Try clearing filters or add a new menu dish.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/2 transition-colors"
                >
                  {/* Left: Dish Info */}
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

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white tracking-tight">{item.name}</h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                          ★ {item.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {item.prepTimeMinutes} mins prep
                        </span>
                        <span>&bull;</span>
                        <span>{item.ordersToday} ordered today</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price + Stock Toggle + Actions */}
                  <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-mono text-slate-500 uppercase">Price</p>
                      <p className="text-base font-black text-white tabular-nums">₹{item.price}</p>
                    </div>

                    {/* Stock Toggle Switch */}
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
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-blue-400" />
                Add New Dish to Menu
              </h3>
              <button
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Dish / Item Name</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Garlic Butter Lobster Tail"
                  required
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Category</label>
                  <select
                    value={newItemCat}
                    onChange={(e) => setNewItemCat(e.target.value)}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
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
                  <label className="block text-xs font-bold text-slate-300 uppercase">Price (₹)</label>
                  <input
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="350"
                    required
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={newItemPrepTime}
                    onChange={(e) => setNewItemPrepTime(e.target.value)}
                    placeholder="15"
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Dietary Type</label>
                  <select
                    value={newItemIsVeg ? 'veg' : 'nonveg'}
                    onChange={(e) => setNewItemIsVeg(e.target.value === 'veg')}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="nonveg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Description</label>
                <textarea
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Brief ingredients and preparation details…"
                  rows={3}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Add Dish to Menu
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
                <Layers className="w-5 h-5 text-blue-400" />
                Add New Menu Category
              </h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-slate-500 hover:text-white"
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
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
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
