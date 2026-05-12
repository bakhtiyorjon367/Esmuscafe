import type { CartItem } from '@/types';

export function getProductId(item: CartItem): string {
  if (typeof item.productId === 'string') return item.productId;
  return item.productId._id;
}

export function getProductName(item: CartItem): string {
  if (typeof item.productId === 'object' && item.productId !== null) {
    return item.productId.name;
  }
  return 'Unknown';
}

export function getProductImage(item: CartItem): string {
  if (typeof item.productId === 'object' && item.productId !== null) {
    return item.productId.image;
  }
  return '';
}

export function getEffectivePrice(item: CartItem): number {
  if (typeof item.productId === 'object' && item.productId !== null) {
    const p = item.productId;
    return p.discount > 0 ? p.price - p.discount : p.price;
  }
  return item.priceSnapshot;
}
