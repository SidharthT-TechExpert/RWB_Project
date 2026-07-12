'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Leaf, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useMyRestaurants } from '@/hooks/useRestaurants';
import toast from 'react-hot-toast';

export default function DashboardMenuPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
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

  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => api.patch(`/food/${restaurantId}/items/${itemId}/toggle`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] }); toast.success('Item updated'); },
    onError: () => toast.error('Failed to update item'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => api.delete(`/food/${restaurantId}/items/${itemId}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dashboard', 'menu'] }); toast.success('Item deleted'); },
    onError: () => toast.error('Failed to delete item'),
  });

  const categories = menu?.categories || [];
  const items = menu?.items || [];
  const filteredItems = activeCategory ? items.filter((i: { categoryId: string }) => i.categoryId === activeCategory) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Category</Button>
          <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Categories sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-3">Categories</p>
          <button
            onClick={() => setActiveCategory(null)}
            className={cn('w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              !activeCategory ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'hover:bg-muted')}
          >
            All Items <span className="text-muted-foreground font-normal">({items.length})</span>
          </button>
          {categories.map((cat: { _id: string; name: string }) => {
            const count = items.filter((i: { categoryId: string }) => i.categoryId === cat._id).length;
            return (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={cn('w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  activeCategory === cat._id ? 'bg-brand-50 dark:bg-brand-950 text-brand-600' : 'hover:bg-muted')}
              >
                {cat.name} <span className="text-muted-foreground font-normal">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Items grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredItems.map((item: {
                _id: string;
                name: string;
                description: string;
                basePrice: number;
                isAvailable: boolean;
                isVegetarian: boolean;
                isSpicy: boolean;
                isPopular: boolean;
              }) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('p-4 rounded-2xl border bg-card transition-opacity', !item.isAvailable && 'opacity-60')}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn('w-3 h-3 rounded-sm border-2 flex items-center justify-center shrink-0', item.isVegetarian ? 'border-green-600' : 'border-red-500')}>
                          <div className={cn('w-1.5 h-1.5 rounded-full', item.isVegetarian ? 'bg-green-600' : 'bg-red-500')} />
                        </div>
                        <p className="font-semibold text-sm truncate">{item.name}</p>
                        {item.isPopular && <Badge variant="brand" className="text-xs py-0 shrink-0">Popular</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                      <p className="font-bold text-brand-500 mt-2">{formatCurrency(item.basePrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <button
                      onClick={() => toggleMutation.mutate(item._id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.isAvailable ? (
                        <><ToggleRight className="h-4 w-4 text-green-500" /> Available</>
                      ) : (
                        <><ToggleLeft className="h-4 w-4 text-muted-foreground" /> Unavailable</>
                      )}
                    </button>
                    <div className="flex gap-1 ml-auto">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteMutation.mutate(item._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-4xl mb-3">🍽️</p>
              <p className="font-semibold mb-2">No menu items yet</p>
              <Button size="sm" className="gap-2 mt-2"><Plus className="h-4 w-4" /> Add your first item</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
