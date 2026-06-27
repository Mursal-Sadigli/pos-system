import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number) => void;
}

function calculateTotals(items: CartItem[], discount: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = Math.max(0, subtotal + tax - discount);

  return { subtotal, tax, total };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,

      addItem: (product) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        const nextItems = existingItem
          ? items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...items, { ...product, quantity: 1 }];

        set({
          items: nextItems,
          ...calculateTotals(nextItems, get().discount),
        });
      },

      removeItem: (id) => {
        const nextItems = get().items.filter((item) => item.id !== id);
        set({
          items: nextItems,
          ...calculateTotals(nextItems, get().discount),
        });
      },

      updateQuantity: (id, delta) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          get().removeItem(id);
          return;
        }

        const nextItems = items.map((i) =>
          i.id === id ? { ...i, quantity: newQuantity } : i
        );

        set({
          items: nextItems,
          ...calculateTotals(nextItems, get().discount),
        });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          discount: 0,
          total: 0,
        });
      },

      setDiscount: (amount) => {
        const { items } = get();
        set({
          discount: amount,
          ...calculateTotals(items, amount),
        });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
