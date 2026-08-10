'use client';

import React, { useState } from 'react';
import { ManagerHeader } from '@/components/manager/ManagerHeader';
import { useCurrentBranch } from '@/hooks/useBranches';
import toast from 'react-hot-toast';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Search,
  UtensilsCrossed,
  Eye,
  EyeOff,
  X,
  Tag,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  itemCount: number;
  isActive: boolean;
  displayOrder: number;
  description: string;
  portionScheme?: 'none' | 'quarter_half_full' | 'small_medium_large' | 'volume';
}

const PORTION_SCHEME_LABELS: Record<string, string> = {
  none: 'Standard Price',
  quarter_half_full: 'Quarter / Half / Full',
  small_medium_large: 'Small / Medium / Large',
  volume: '250ml / 500ml / 1L',
};

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'c1', name: 'Appetizers', itemCount: 12, isActive: true, displayOrder: 1, description: 'Starters, soups, and small sharing plates.', portionScheme: 'quarter_half_full' },
  { id: 'c2', name: 'Main Course', itemCount: 18, isActive: true, displayOrder: 2, description: 'Chef signatures, grilled meats & risotto.', portionScheme: 'quarter_half_full' },
  { id: 'c3', name: 'Specialty Pizzas', itemCount: 8, isActive: true, displayOrder: 3, description: 'Wood-fired artisanal pizzas & flatbreads.', portionScheme: 'small_medium_large' },
  { id: 'c4', name: 'Desserts', itemCount: 6, isActive: true, displayOrder: 4, description: 'Cakes, gelato, and artisanal sweet delights.', portionScheme: 'none' },
  { id: 'c5', name: 'Beverages', itemCount: 14, isActive: true, displayOrder: 5, description: 'Cold brews, fresh juices & signature mocktails.', portionScheme: 'volume' },
  { id: 'c6', name: 'Chef Specials', itemCount: 5, isActive: true, displayOrder: 6, description: 'Limited-edition seasonal specials.', portionScheme: 'none' },
];

export default function ManagerCategoriesPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);

  // Form states for Add / Edit
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState('1');
  const [catPortionScheme, setCatPortionScheme] = useState<'none' | 'quarter_half_full' | 'small_medium_large' | 'volume'>('quarter_half_full');

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive;
          toast.success(`Category "${c.name}" is now ${nextState ? 'VISIBLE' : 'HIDDEN'} on guest menu`);
          return { ...c, isActive: nextState };
        }
        return c;
      })
    );
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success(`Category "${name}" deleted.`);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const nameClean = catName.trim();
    if (!nameClean) {
      toast.error('Category name required');
      return;
    }

    const created: CategoryItem = {
      id: `c_${Date.now()}`,
      name: nameClean,
      itemCount: 0,
      isActive: true,
      displayOrder: parseInt(catOrder, 10) || (categories.length + 1),
      description: catDesc.trim() || 'Menu category for branch dishes.',
      portionScheme: catPortionScheme,
    };

    setCategories((prev) => [...prev, created]);
    toast.success(`Category "${nameClean}" created! 🎉`);
    setCatName('');
    setCatDesc('');
    setShowAddModal(false);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatOrder(cat.displayOrder.toString());
    setCatPortionScheme(cat.portionScheme || 'none');
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    const nameClean = catName.trim();
    if (!nameClean) {
      toast.error('Category name required');
      return;
    }

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCat.id
          ? {
              ...c,
              name: nameClean,
              description: catDesc.trim(),
              displayOrder: parseInt(catOrder, 10) || c.displayOrder,
              portionScheme: catPortionScheme,
            }
          : c
      )
    );

    toast.success(`Category "${nameClean}" updated! ✨`);
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = categories.filter((c) => c.isActive).length;
  const hiddenCount = categories.length - activeCount;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#030816] text-slate-100 min-h-screen">
      <ManagerHeader pageTitle="Menu Architecture & Categories" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[2400px] w-full mx-auto pb-24">

        {/* ── Premium Hero Banner ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-[#0d1528] to-indigo-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_60%)]" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5 p-5 sm:p-7">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-[10px] font-mono font-black text-blue-400 uppercase tracking-[0.2em]">MENU STRUCTURE</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Restaurant Categories &amp; Portion Rules</h1>
              <p className="text-xs text-slate-400 max-w-md">Organize outlet dishes into active menu sections with default portion measurements (Quarter, Half, Full, Sizes).</p>
            </div>

            <button
              onClick={() => {
                setCatName('');
                setCatDesc('');
                setCatOrder((categories.length + 1).toString());
                setCatPortionScheme('quarter_half_full');
                setShowAddModal(true);
              }}
              className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs gap-2 flex items-center shadow-lg shadow-blue-600/25 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative rounded-2xl bg-blue-500/8 border border-blue-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-blue-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">Total Categories</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-blue-400 leading-none tabular-nums">{categories.length}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">active architecture sections</p>
          </div>

          <div className="relative rounded-2xl bg-emerald-500/8 border border-emerald-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">Visible on Menu</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-emerald-400 leading-none tabular-nums">{activeCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">currently visible to customers</p>
          </div>

          <div className="relative rounded-2xl bg-rose-500/8 border border-rose-500/20 p-4 sm:p-5 overflow-hidden shadow-lg shadow-rose-500/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-[0.15em]">Hidden Sections</p>
              </div>
              <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-black text-rose-400 leading-none tabular-nums">{hiddenCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1.5">temporarily unlisted</p>
          </div>
        </div>

        {/* ── Search & Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category name or description…"
              className="w-full bg-[#080F22]/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <span className="text-xs font-mono text-slate-500">
            Showing <strong className="text-white">{filteredCategories.length}</strong> of <strong className="text-white">{categories.length}</strong> sections
          </span>
        </div>

        {/* ── Categories Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 p-5 flex flex-col justify-between space-y-4 ${
                cat.isActive
                  ? 'bg-[#080e1e]/90 border-blue-500/15 hover:border-blue-500/35 shadow-[0_0_40px_rgba(59,130,246,0.08)]'
                  : 'bg-[#080e1e]/50 border-slate-800/60 opacity-60'
              }`}
            >
              {/* Top Accent Line */}
              <div className={`absolute top-0 inset-x-0 h-[2px] ${cat.isActive ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent' : 'bg-slate-700/50'}`} />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 text-blue-400 flex items-center justify-center font-black text-sm shrink-0">
                      #{cat.displayOrder}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight">{cat.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500 flex items-center gap-1 mt-0.5">
                        <UtensilsCrossed className="w-3 h-3 text-blue-400" />
                        {cat.itemCount} items assigned
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors shrink-0 ${
                      cat.isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {cat.isActive ? '● Active' : '○ Hidden'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{cat.description}</p>

                {/* Portion measurement badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                    <span>📏 Portion Type:</span>
                    <span className="text-white">{PORTION_SCHEME_LABELS[cat.portionScheme || 'none']}</span>
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/6 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">Order Priority: #{cat.displayOrder}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className="w-8 h-8 rounded-lg bg-white/4 hover:bg-white/10 border border-white/8 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={cat.isActive ? 'Hide from customer view' : 'Show on customer view'}
                  >
                    {cat.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="w-8 h-8 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit category details & portion rules"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── MODAL: ADD CATEGORY ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Add Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Biryani &amp; Rice Specialties"
                  required
                  autoFocus
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Order Priority #</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    placeholder="1"
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Portion Pricing Scheme</label>
                  <select
                    value={catPortionScheme}
                    onChange={(e) => setCatPortionScheme(e.target.value as any)}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="none">Single Standard Price</option>
                    <option value="quarter_half_full">Quarter / Half / Full</option>
                    <option value="small_medium_large">Small / Medium / Large</option>
                    <option value="volume">Volume (250ml / 500ml / 1L)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Category description for customer menu view…"
                  rows={3}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT CATEGORY ── */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Edit Category Details &amp; Portion Rules
              </h3>
              <button onClick={() => setEditingCat(null)} className="text-slate-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Category Name</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Category name"
                  required
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Order Priority #</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">Portion Pricing Scheme</label>
                  <select
                    value={catPortionScheme}
                    onChange={(e) => setCatPortionScheme(e.target.value as any)}
                    className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="none">Single Standard Price</option>
                    <option value="quarter_half_full">Quarter / Half / Full</option>
                    <option value="small_medium_large">Small / Medium / Large</option>
                    <option value="volume">Volume (250ml / 500ml / 1L)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase">Description</label>
                <textarea
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


