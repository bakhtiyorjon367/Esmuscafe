import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Cart, CartItem, Product } from '../types';
import * as cartApi from '../lib/cart';
import { isAuthenticated } from '../lib/auth';

interface CartContextValue {
  cart: Cart | null;
  totalItems: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = 'esmuscafe_cart';
/** Debounce delay in ms before syncing quantity changes to server */
const SYNC_DEBOUNCE_MS = 800;

function countItems(items: CartItem[]): number {
  return items.length;
}

function loadLocalCart(): Cart | null {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalCart(cart: Cart | null): void {
  if (cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } else {
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(() => loadLocalCart());
  const [loading, setLoading] = useState(false);

  /** Pending quantity syncs: productId → { quantity, timerId } */
  const pendingSyncs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const syncCart = useCallback(async () => {
    if (!isAuthenticated()) return;
    try {
      const serverCart = await cartApi.getCart();
      setCart(serverCart);
      saveLocalCart(serverCart);
    } catch {
      // keep local cart if server fails
    }
  }, []);

  useEffect(() => {
    syncCart();
  }, [syncCart]);

  const applyCart = (updated: Cart) => {
    setCart(updated);
    saveLocalCart(updated);
  };

  /** Optimistically mutate local cart state without touching the server */
  const applyLocalUpdate = (updater: (prev: Cart) => Cart) => {
    setCart((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveLocalCart(next);
      return next;
    });
  };

  const addItem = async (productId: string, quantity = 1) => {
    setLoading(true);
    try {
      const updated = await cartApi.addCartItem(productId, quantity);
      applyCart(updated);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update quantity optimistically (instant UI), then debounce the server call.
   * If quantity reaches 0, treat as remove.
   */
  const updateItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    // Instant local update
    applyLocalUpdate((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        const id = typeof item.productId === 'string' ? item.productId : (item.productId as Product)._id;
        return id === productId ? { ...item, quantity } : item;
      }),
    }));

    // Cancel any pending sync for this product
    const existing = pendingSyncs.current.get(productId);
    if (existing) clearTimeout(existing);

    // Schedule a debounced server sync
    const timer = setTimeout(async () => {
      pendingSyncs.current.delete(productId);
      try {
        await cartApi.updateCartItem(productId, quantity);
      } catch {
        // on failure, re-sync from server to correct local state
        syncCart();
      }
    }, SYNC_DEBOUNCE_MS);

    pendingSyncs.current.set(productId, timer);
  };

  /** Remove optimistically, then confirm with server in background */
  const removeItem = (productId: string) => {
    // Cancel any pending quantity sync for this item
    const existing = pendingSyncs.current.get(productId);
    if (existing) {
      clearTimeout(existing);
      pendingSyncs.current.delete(productId);
    }

    // Instant local remove
    applyLocalUpdate((prev) => {
      const items = prev.items.filter((item) => {
        const id = typeof item.productId === 'string' ? item.productId : (item.productId as Product)._id;
        return id !== productId;
      });
      return { ...prev, items, restaurantId: items.length === 0 ? null : prev.restaurantId };
    });

    // Fire-and-forget server remove
    cartApi.removeCartItem(productId).catch(() => syncCart());
  };

  const clear = async () => {
    // Cancel all pending syncs
    pendingSyncs.current.forEach((t) => clearTimeout(t));
    pendingSyncs.current.clear();

    setLoading(true);
    try {
      const updated = await cartApi.clearCart();
      applyCart(updated);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = cart ? countItems(cart.items) : 0;

  return (
    <CartContext.Provider value={{ cart, totalItems, loading, addItem, updateItem, removeItem, clear, refreshCart: syncCart }}>
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function getProductId(item: CartItem): string {
  if (typeof item.productId === 'string') return item.productId;
  return (item.productId as Product)._id;
}

export function getProductName(item: CartItem): string {
  if (typeof item.productId === 'object' && item.productId !== null) {
    return (item.productId as Product).name;
  }
  return 'Unknown';
}

export function getProductImage(item: CartItem): string {
  if (typeof item.productId === 'object' && item.productId !== null) {
    return (item.productId as Product).image;
  }
  return '';
}

export function getEffectivePrice(item: CartItem): number {
  if (typeof item.productId === 'object' && item.productId !== null) {
    const p = item.productId as Product;
    return p.discount > 0 ? p.price - p.discount : p.price;
  }
  return item.priceSnapshot;
}
