import { create } from 'zustand';

export interface CartItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variantId?: string;
  variantName?: string;
  addOns: { id: string; name: string; price: number }[];
  specialInstructions?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: CartItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (foodItemId: string, variantId?: string) => void;
  updateQuantity: (foodItemId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,

  addItem: (item, restaurantId, restaurantName) => {
    const { items, restaurantId: current } = get();
    if (current && current !== restaurantId) {
      set({ items: [item], restaurantId, restaurantName });
      return;
    }
    const existing = items.find((i) => i.foodItemId === item.foodItemId && i.variantId === item.variantId);
    if (existing) {
      set({ items: items.map((i) => i.foodItemId === item.foodItemId && i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i) });
    } else {
      set({ items: [...items, item], restaurantId, restaurantName });
    }
  },

  removeItem: (foodItemId, variantId) =>
    set((s) => ({ items: s.items.filter((i) => !(i.foodItemId === foodItemId && i.variantId === variantId)) })),

  updateQuantity: (foodItemId, quantity, variantId) => {
    if (quantity <= 0) { get().removeItem(foodItemId, variantId); return; }
    set((s) => ({ items: s.items.map((i) => i.foodItemId === foodItemId && i.variantId === variantId ? { ...i, quantity } : i) }));
  },

  clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

  getTotal: () => get().items.reduce((sum, item) => {
    const addOnsTotal = item.addOns.reduce((a, addon) => a + addon.price, 0);
    return sum + (item.price + addOnsTotal) * item.quantity;
  }, 0),

  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
