/** Base URL for static files served by the API (`/uploads/...`). */
function getFileBaseUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin;
  }
  const base = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
  if (base) return base;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return '';
}

/** Absolute URL for an image path returned by the API (or any http(s) URL). */
export function apiFileUrl(relativeOrAbsolute: string): string {
  if (!relativeOrAbsolute) return relativeOrAbsolute;
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  const path = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : `/${relativeOrAbsolute}`;
  return `${getFileBaseUrl()}${path}`;
}

/** Maps a stored full-size upload path to its pre-rendered 80×80 thumb path. */
export function productImageThumbPath(fullPath: string): string {
  if (!fullPath || !fullPath.includes('/uploads/products/') || fullPath.includes('_thumb.')) {
    return fullPath;
  }
  return fullPath.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
}

/** Thumb URL for grids and lists. */
export function productThumbSrcForDisplay(fullPath: string): string {
  return apiFileUrl(productImageThumbPath(fullPath));
}

/** Full-size URL for detail views. */
export function productImageSrcForDisplay(fullPath: string): string {
  return apiFileUrl(fullPath);
}

export const MAX_PRODUCT_IMAGES = 5;

/** Stored image paths for a product (supports legacy single `image`). */
export function productImagePaths(product: { image?: string; images?: string[] }): string[] {
  if (product.images?.length) return product.images;
  if (product.image) return [product.image];
  return [];
}

export function productPrimaryImage(product: { image?: string; images?: string[] }): string {
  return productImagePaths(product)[0] ?? '';
}
