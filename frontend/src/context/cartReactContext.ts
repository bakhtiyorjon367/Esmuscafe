import { createContext } from 'react';
import type { Cart } from '../types';

export interface CartContextValue {
  cart: Cart | null;
  totalItems: number;
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextValue | null>(null);
