'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, ShippingRates, shippingRates as defaultShippingRates } from './products';

// ============================================
// CART TYPES
// ============================================

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  maxStock: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  shippingMethod: 'standard' | 'express';
  shippingRates: ShippingRates;

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setShippingMethod: (method: 'standard' | 'express') => void;
  setShippingRates: (rates: ShippingRates) => void;
  clearCart: () => void;

  // Computed (as functions since Zustand doesn't support getters well)
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  isEligibleForFreeShipping: () => boolean;
  amountUntilFreeShipping: () => number;
}

// ============================================
// CART STORE
// ============================================

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingMethod: 'standard',
      shippingRates: defaultShippingRates,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.variantId === variant.id);

          if (existingItem) {
            // Update quantity if item exists
            return {
              items: state.items.map(item =>
                item.variantId === variant.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stock) }
                  : item
              ),
            };
          }

          // Add new item
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                variantId: variant.id,
                productName: product.name,
                variantName: variant.name,
                price: variant.price,
                quantity: Math.min(quantity, variant.stock),
                maxStock: variant.stock,
                image: product.images[0] || '/merch/placeholder.jpg',
              },
            ],
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter(item => item.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter(item => item.variantId !== variantId) };
          }
          return {
            items: state.items.map(item =>
              item.variantId === variantId
                ? { ...item, quantity: Math.min(quantity, item.maxStock) }
                : item
            ),
          };
        });
      },

      setShippingMethod: (method) => {
        set({ shippingMethod: method });
      },

      setShippingRates: (rates) => {
        set({ shippingRates: rates });
      },

      clearCart: () => {
        set({ items: [], shippingMethod: 'standard' });
      },

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getShipping: () => {
        const { shippingMethod, shippingRates } = get();
        const subtotal = get().getSubtotal();
        if (subtotal >= shippingRates.freeShippingThreshold) {
          return 0;
        }
        return shippingRates[shippingMethod].price;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShipping();
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      isEligibleForFreeShipping: () => {
        const { shippingRates } = get();
        return get().getSubtotal() >= shippingRates.freeShippingThreshold;
      },

      amountUntilFreeShipping: () => {
        const { shippingRates } = get();
        const subtotal = get().getSubtotal();
        const remaining = shippingRates.freeShippingThreshold - subtotal;
        return remaining > 0 ? remaining : 0;
      },
    }),
    {
      name: 'unholy-rodents-cart',
    }
  )
);
