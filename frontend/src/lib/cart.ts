import api from './api';
import { Cart } from '../types';

export const getCart = (): Promise<Cart> =>
  api.get<Cart>('/cart').then((r) => r.data);

export const addCartItem = (productId: string, quantity = 1): Promise<Cart> =>
  api.post<Cart>('/cart/items', { productId, quantity }).then((r) => r.data);

export const updateCartItem = (productId: string, quantity: number): Promise<Cart> =>
  api.patch<Cart>(`/cart/items/${productId}`, { quantity }).then((r) => r.data);

export const removeCartItem = (productId: string): Promise<Cart> =>
  api.delete<Cart>(`/cart/items/${productId}`).then((r) => r.data);

export const clearCart = (): Promise<Cart> =>
  api.delete<Cart>('/cart').then((r) => r.data);
