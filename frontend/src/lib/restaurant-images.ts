import { apiFileUrl } from '@/lib/product-images';

/** Thumb URL for restaurant list thumbnails. */
export function restaurantThumbSrcForDisplay(path: string): string {
  if (!path) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.includes('/uploads/restaurants/') || path.includes('_thumb.')) {
    return apiFileUrl(path);
  }
  const thumb = path.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
  return apiFileUrl(thumb);
}

/** Full-size URL for previews. */
export function restaurantImageSrcForDisplay(path: string): string {
  return apiFileUrl(path);
}
