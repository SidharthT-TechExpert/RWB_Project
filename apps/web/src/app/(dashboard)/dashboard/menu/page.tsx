'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Leaf,
  Flame,
  X,
  UtensilsCrossed,
  Layers,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ImageUpload } from '@/components/ui/ImageUpload';
import api from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  coverImage?: string;
  images?: string[];
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  categoryId: string;
  preparationTime?: number;
}

interface Category {
  _id: string;
  name: string;
}

export default function DashboardMenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Form State
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    coverImage: '',
    isVegetarian: true,
    isSpicy: false,
    preparationTime: '20',
  });

  const [newCatName, setNewCatName] = useState('');

  const { data: restaurants } = useMyRestaurants();
  const restaurantId = restaurants?.data?.[0]?._id;
  const qc = useQueryClient();

  const { data: menu, isLoading } = useQuery({
    queryKey: ['dashboard', 'menu', restaurantId],
    queryFn: async () => {
      const { data } = await api.get(`/food/${restaurantId}/menu`);
      return data.data;
    },
    enabled: !!restaurantId,
  });

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      return api.post(`/food/${restaurantId}/categories`, { name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] });
      toast.success('Category created! 🎉');
      setNewCatName('');
      setShowAddCatModal(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create category');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post(`/food/${restaurantId}/items`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] });
      toast.success('Menu item added successfully! 🎉');
      setShowAddModal(false);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return api.put(`/food/${restaurantId}/items/${id}`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] });
      toast.success('Menu item updated! ✨');
      setEditingItem(null);
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update item');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) =>
      api.patch(`/food/${restaurantId}/items/${itemId}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] });
      toast.success('Item availability toggled');
    },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) =>
      api.delete(`/food/${restaurantId}/items/${itemId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] });
      toast.success('Item deleted');
    },
    onError: () => toast.error('Failed to delete item'),
  });

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      basePrice: '',
      categoryId: categories?.[0]?._id || '',
      coverImage: '',
      isVegetarian: true,
      isSpicy: false,
      preparationTime: '20',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    if (categories.length > 0) {
      setItemForm((prev) => ({ ...prev, categoryId: categories[0]._id }));
    }
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      description: item.description || '',
      basePrice: item.basePrice.toString(),
      categoryId: item.categoryId || (categories?.[0]?._id ?? ''),
      coverImage: item.coverImage || item.images?.[0] || '',
      isVegetarian: item.isVegetarian ?? true,
      isSpicy: item.isSpicy ?? false,
      preparationTime: (item.preparationTime || 20).toString(),
    });
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemForm.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!itemForm.categoryId) {
      toast.error('Please select a category (or create one first)');
      return;
    }

    // MANDATORY CLOUDINARY IMAGE CHECK
    if (!itemForm.coverImage || !itemForm.coverImage.trim()) {
      toast.error('Food photo is required! Please upload an image to Cloudinary.', {
        icon: '📸',
        duration: 4000,
      });
      return;
    }

    const payload = {
      name: itemForm.name.trim(),
      description: itemForm.description.trim() || 'Delicious house specialty prepared fresh.',
      basePrice: parseFloat(itemForm.basePrice) || 0,
      categoryId: itemForm.categoryId,
      coverImage: itemForm.coverImage.trim(),
      images: [itemForm.coverImage.trim()],
      isVegetarian: itemForm.isVegetarian,
      isSpicy: itemForm.isSpicy,
      preparationTime: parseInt(itemForm.preparationTime) || 20,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem._id, payload });
    } else {
      createItemMutation.mutate(payload);
    }
  };

  const categories: Category[] = menu?.categories || [];
  const items: FoodItem[] = menu?.items || [];
  const filteredItems = activeCategory
    ? items.filter((i) => i.categoryId === activeCategory)
    : items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Menu Management</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your restaurant catalog, pricing, and high-resolution food images.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddCatModal(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-2 bg-[#FF6B35] hover:bg-[#FF551A] text-white">
            <Plus className="h-4 w-4" /> Add Menu Item
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between px-2 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Categories</p>
            <button
              onClick={() => setShowAddCatModal(true)}
              className="text-[11px] font-bold text-[#FF6B35] hover:underline"
            >
              + New
            </button>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              !activeCategory
                ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 font-bold'
                : 'hover:bg-muted text-muted-foreground'
            )}
          >
            All Items <span className="text-muted-foreground font-normal">({items.length})</span>
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.categoryId === cat._id).length;
            return (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={cn(
                  'w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  activeCategory === cat._id
                    ? 'bg-brand-50 dark:bg-brand-950 text-brand-600 font-bold'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                {cat.name}{' '}
                <span className="text-muted-foreground font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-36 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-4 rounded-2xl border bg-card transition-all flex flex-col justify-between hover:shadow-md group',
                    !item.isAvailable && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    {/* Food Photo */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
                      {item.coverImage || item.images?.[0] ? (
                        <Image
                          src={item.coverImage || item.images![0]}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className={cn(
                            'w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center shrink-0',
                            item.isVegetarian ? 'border-green-600' : 'border-red-500'
                          )}
                        >
                          <div
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              item.isVegetarian ? 'bg-green-600' : 'bg-red-500'
                            )}
                          />
                        </div>
                        <p className="font-bold text-sm truncate text-foreground">{item.name}</p>
                        {item.isPopular && (
                          <Badge variant="brand" className="text-[10px] py-0 shrink-0">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-black text-brand-500 text-sm">
                          {formatCurrency(item.basePrice)}
                        </p>
                        {item.preparationTime && (
                          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.preparationTime}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2.5 border-t border-border/60">
                    <button
                      onClick={() => toggleMutation.mutate(item._id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.isAvailable ? (
                        <>
                          <ToggleRight className="h-4 w-4 text-green-500" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                    <div className="flex gap-1 ml-auto">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit dish"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) {
                            deleteMutation.mutate(item._id);
                          }
                        }}
                        title="Delete dish"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-card/40">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-bold text-foreground mb-1">No menu items yet</p>
              <p className="text-xs max-w-xs mx-auto mb-4">
                Add delicious food items with photo uploads to start taking orders.
              </p>
              <Button
                size="sm"
                onClick={handleOpenAdd}
                className="gap-2 bg-[#FF6B35] hover:bg-[#FF551A] text-white"
              >
                <Plus className="h-4 w-4" /> Add your first item
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: ADD / EDIT MENU ITEM ── */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200 my-8 text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-[#FF6B35]" />
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* 📸 MANDATORY CLOUDINARY IMAGE UPLOAD */}
              <ImageUpload
                value={itemForm.coverImage}
                onChange={(url) => setItemForm((prev) => ({ ...prev, coverImage: url }))}
                required={true}
                label="Food Photo (Cloudinary Upload)"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Dish / Item Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Wood-Fired Margherita Pizza"
                  required
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    required
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                  >
                    {categories.length === 0 && <option value="">No categories yet</option>}
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Price (₹) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemForm.basePrice}
                    onChange={(e) => setItemForm({ ...itemForm, basePrice: e.target.value })}
                    placeholder="250"
                    required
                    min={0}
                    step="0.01"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, preparationTime: e.target.value })
                    }
                    placeholder="20"
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Dietary Type
                  </label>
                  <select
                    value={itemForm.isVegetarian ? 'veg' : 'nonveg'}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, isVegetarian: e.target.value === 'veg' })
                    }
                    className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                  >
                    <option value="veg">🟢 Vegetarian</option>
                    <option value="nonveg">🔴 Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Ingredients, preparation details, flavors…"
                  rows={2}
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#FF6B35] resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF551A] text-white text-xs font-bold shadow-lg shadow-[#FF6B35]/30 cursor-pointer flex items-center gap-1.5"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending ? (
                    'Saving…'
                  ) : editingItem ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Add Item
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CATEGORY ── */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Layers className="w-5 h-5 text-[#FF6B35]" />
                Add Category
              </h3>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatName.trim()) {
                  toast.error('Enter category name');
                  return;
                }
                createCategoryMutation.mutate(newCatName.trim());
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Starters, Main Course, Shakes"
                  required
                  autoFocus
                  className="w-full bg-background border border-input rounded-xl px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-[#FF6B35]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF551A] text-white text-xs font-bold shadow-lg shadow-[#FF6B35]/30 cursor-pointer"
                >
                  {createCategoryMutation.isPending ? 'Creating…' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
