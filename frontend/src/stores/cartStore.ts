/**
 * Cart Store
 * Zustand store for cart management with optimistic updates
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MenuItem, CartItem, AppliedModifier, Cart } from '../types/index.ts';

/**
 * Generate a unique ID for cart items
 */
function generateCartItemId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate item price including modifiers
 */
function calculateItemPrice(
  menuItem: MenuItem,
  quantity: number,
  modifiersApplied: AppliedModifier[]
): number {
  let basePrice = menuItem.price * quantity;

  for (const applied of modifiersApplied) {
    const modifier = menuItem.modifiers.find((m) => m.id === applied.modifierId);
    if (modifier) {
      for (const optionId of applied.optionIds) {
        const option = modifier.options.find((o) => o.id === optionId);
        if (option) {
          basePrice += option.price * quantity;
        }
      }
    }
  }

  return basePrice;
}

/**
 * Cart state interface
 */
interface CartState {
  items: CartItem[];
  taxRate: number;
  serviceChargePercent: number;
  
  // Actions
  addItem: (
    menuItem: MenuItem,
    quantity: number,
    modifiersApplied: AppliedModifier[],
    notes: string
  ) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  updateNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  setTaxSettings: (taxRate: number, serviceChargePercent: number) => void;
  
  // Computed values (as functions)
  getCart: () => Cart;
  getItemCount: () => number;
  getItemById: (cartItemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      taxRate: 5,
      serviceChargePercent: 10,

      addItem: (menuItem, quantity, modifiersApplied, notes) => {
        const totalPrice = calculateItemPrice(menuItem, quantity, modifiersApplied);
        
        const newItem: CartItem = {
          id: generateCartItemId(),
          menuItem,
          quantity,
          modifiersApplied,
          notes,
          totalPrice,
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === cartItemId) {
              const newTotalPrice = calculateItemPrice(
                item.menuItem,
                quantity,
                item.modifiersApplied
              );
              return { ...item, quantity, totalPrice: newTotalPrice };
            }
            return item;
          }),
        }));
      },

      updateNotes: (cartItemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, notes } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setTaxSettings: (taxRate, serviceChargePercent) => {
        set({ taxRate, serviceChargePercent });
      },

      getCart: () => {
        const state = get();
        const totalAmount = state.items.reduce((sum, item) => sum + item.totalPrice, 0);
        const taxAmount = totalAmount * (state.taxRate / 100);
        const serviceCharge = totalAmount * (state.serviceChargePercent / 100);
        const grandTotal = totalAmount + taxAmount + serviceCharge;

        return {
          items: state.items,
          totalAmount,
          taxAmount,
          serviceCharge,
          grandTotal,
        };
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getItemById: (cartItemId) => {
        return get().items.find((item) => item.id === cartItemId);
      },
    }),
    {
      name: 'restaurant-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        taxRate: state.taxRate,
        serviceChargePercent: state.serviceChargePercent,
      }),
    }
  )
);

export default useCartStore;
