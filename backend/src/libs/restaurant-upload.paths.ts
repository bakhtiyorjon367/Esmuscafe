import { join } from 'path';

/** Public URL prefix for files under `uploads/restaurants` (served by Nest static). */
export const RESTAURANT_UPLOAD_PUBLIC_PREFIX = '/uploads/restaurants';

/** Absolute filesystem directory for restaurant images. */
export function getRestaurantsUploadAbsoluteDir(): string {
  return join(process.cwd(), 'uploads', 'restaurants');
}

/** Derives the public thumb URL from a full-size upload path. */
export function restaurantThumbPublicPathFromFull(fullPublicPath: string): string {
  if (!fullPublicPath.includes(`${RESTAURANT_UPLOAD_PUBLIC_PREFIX}/`) || fullPublicPath.includes('_thumb.')) {
    return fullPublicPath;
  }
  return fullPublicPath.replace(/(\.[a-z0-9]+)(\?.*)?$/i, '_thumb$1$2');
}
