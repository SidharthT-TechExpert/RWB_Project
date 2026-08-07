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
  XCircle,
  Search,
  UtensilsCrossed,
  ArrowUpDown,
  Eye,
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  itemCount: number;
  isActive: boolean;
  displayOrder: number;
  description: string;
}

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'c1', name: 'Appetizers', itemCount: 12, isActive: true, displayOrder: 1, description: 'Starters, soups, and small sharing plates.' },
  { id: 'c2', name: 'Main Course', itemCount: 18, isActive: true, displayOrder: 2, description: 'Chef signatures, grilled meats & risotto.' },
  { id: 'c3', name: 'Specialty Pizzas', itemCount: 8, isActive: true, displayOrder: 3, description: 'Wood-fired artisanal pizzas & flatbreads.' },
  { id: 'c4', name: 'Desserts', itemCount: 6, isActive: true, displayOrder: 4, description: 'Cakes, gelato, and artisanal sweet delights.' },
  { id: 'c5', name: 'Beverages', itemCount: 14, isActive: true, displayOrder: 5, description: 'Cold brews, fresh juices & signature mocktails.' },
  { id: 'c6', name: 'Chef Specials', itemCount: 5, isActive: true, displayOrder: 6, description: 'Limited-edition seasonal specials.' },
];

export default function ManagerCategoriesPage() {
  const currentBranch = useCurrentBranch();
  const branchName = currentBranch?.name || 'Assigned Branch';

  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isActive;
          toast.success(`Category "${c.name}" is now ${nextState ? 'VISIBLE' : 'HIDDEN'} on menu`);
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
      displayOrder: categories.length + 1,
      description: catDesc.trim() || 'Menu category for branch dishes.',
    };

    setCategories((prev) => [...prev, created]);
    toast.success(`Category "${nameClean}" created! 🎉`);
    setCatName('');
    setCatDesc('');
    setShowAddModal(false);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#030816] text-slate-100 min-h-screen">
      <ManagerHeader />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-400 uppercase">
                {branchName}
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400 font-medium">Menu Architecture</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-400" />
              Menu Categories
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Search Bar */}
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
            Total Categories: <strong className="text-white">{categories.length}</strong>
          </span>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                cat.isActive
                  ? 'bg-[#080F22]/90 border-slate-800/80 hover:border-blue-500/30 shadow-xl'
                  : 'bg-[#080F22]/50 border-slate-800/40 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-sm">
                      #{cat.displayOrder}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white tracking-tight">{cat.name}</h3>
                      <p className="text-[10px] font-mono text-slate-500">{cat.itemCount} menu items assigned</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-colors ${
                      cat.isActive
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2">{cat.description}</p>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-500">Order #{cat.displayOrder}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCategoryStatus(cat.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title={cat.isActive ? 'Hide Category' : 'Show Category'}
                  >
                    {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-rose-400" />}
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#080F22] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Add Category
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
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
                  placeholder="e.g. Artisanal Mocktails"
                  required
                  autoFocus
                  className="w-full bg-[#030816] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                />
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
