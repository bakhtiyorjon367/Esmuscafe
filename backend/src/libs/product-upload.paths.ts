import { join } from 'path';

/** Public URL prefix for files under `uploads/products` (served by Nest static). */
export const PRODUCT_UPLOAD_PUBLIC_PREFIX = '/uploads/products';

/** Absolute filesystem directory for product originals and thumbnails. */
export function getProductsUploadAbsoluteDir(): string {
  return join(process.cwd(), 'uploads', 'products');
}

/** Derives the public thumb URL from a full-size upload path. */
export function thumbPublicPathFromFull(fullPublicPath: string): string {
  if (!fullPublicPath.includes(`${PRODUCT_UPLOAD_PUBLIC_PREFIX}/`) || fullPublicPath.includes('_thumb.')) {
    return fullPublicPath;
  }
  return fullPublicPath.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
}
