'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Star, Leaf, Flame, Info } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import toast from 'react-hot-toast';

interface FoodItem {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  coverImage?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  spiceLevel?: number;
  isAvailable: boolean;
  isPopular: boolean;
  preparationTime: number;
  averageRating: number;
  variants: { name: string; price: number; isAvailable: boolean }[];
  addOns: { name: string; price: number; isAvailable: boolean }[];
  allergens: string[];
}

interface Category {
  _id: string;
  name: string;
  displayOrder: number;
}

interface MenuSectionProps {
  categories: Category[];
  items: FoodItem[];
  restaurantId: string;
  restaurantName: string;
}

export function MenuSection({ categories, items, restaurantId, restaurantName }: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const filteredItems = items.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || item.categoryId === activeCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const itemsByCategory = categories.map((cat) => ({
    category: cat,
    items: filteredItems.filter((item) => item.categoryId === cat._id),
  })).filter((g) => g.items.length > 0);

  const getCartQty = (foodItemId: string) =>
    cartItems.find((i) => i.foodItemId === foodItemId)?.quantity || 0;

  const handleAdd = (item: FoodItem) => {
    addItem(
      {
        foodItemId: item._id,
        name: item.name,
        price: item.basePrice,
        quantity: 1,
        image: item.coverImage,
        addOns: [],
      },
      restaurantId,
      restaurantName
    );
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        placeholder="Search menu items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
            !activeCategory ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(activeCategory === cat._id ? null : cat._id)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              activeCategory === cat._id ? 'bg-brand-500 text-white border-brand-500' : 'border-border hover:border-brand-300'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Items grouped by category */}
      <div className="space-y-8">
        {itemsByCategory.map(({ category, items: catItems }) => (
          <section key={category._id} id={`category-${category._id}`}>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              {category.name}
              <span className="text-sm font-normal text-muted-foreground">({catItems.length})</span>
            </h3>
            <div className="grid gap-3">
              {catItems.map((item) => (
                <MenuItemCard
                  key={item._id}
                  item={item}
                  quantity={getCartQty(item._id)}
                  onAdd={() => handleAdd(item)}
                  onRemove={() => {
                    const store = useCartStore.getState();
                    const qty = getCartQty(item._id);
                    if (qty > 0) store.updateQuantity(item._id, qty - 1);
                  }}
                />
              ))}
            </div>
          </section>
        ))}

        {itemsByCategory.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-medium">No items found</p>
            <p className="text-sm">Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  quantity,
  onAdd,
  onRemove,
}: {
  item: FoodItem & { categoryId?: string };
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-shadow">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Veg/Non-veg indicator */}
          <div
            className={cn(
              'w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0',
              item.isVegetarian ? 'border-green-600' : 'border-red-600'
            )}
          >
            <div className={cn('w-2 h-2 rounded-full', item.isVegetarian ? 'bg-green-600' : 'bg-red-600')} />
          </div>
          <h4 className="font-medium text-sm">{item.name}</h4>
          {item.isPopular && <Badge variant="brand" className="text-xs py-0">Popular</Badge>}
          {item.isSpicy && <Flame className="h-3.5 w-3.5 text-orange-500" />}
          {item.isVegan && <Leaf className="h-3.5 w-3.5 text-green-600" />}
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>

        {item.averageRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-muted-foreground">{item.averageRating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="font-semibold text-brand-500">{formatCurrency(item.basePrice)}</p>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.div key="add" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Button size="sm" onClick={onAdd} className="h-8 px-4 text-xs rounded-lg">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </motion.div>
            ) : (
              <motion.div key="qty" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
                className="flex items-center gap-2 bg-brand-50 dark:bg-brand-950 rounded-lg border border-brand-200 dark:border-brand-800">
                <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-lg transition-colors">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-sm font-semibold text-brand-700">{quantity}</span>
                <button onClick={onAdd} className="w-8 h-8 flex items-center justify-center text-brand-600 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-lg transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Image */}
      {item.coverImage && (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
          <Image src={item.coverImage} alt={item.name} fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
