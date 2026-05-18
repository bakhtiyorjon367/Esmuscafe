import { getTokenRole } from './auth';
import { hasSelectedRestaurant } from './categoryRestaurant';

/** Owner dashboard routes that show the bottom tab bar. */
export const OWNER_TAB_PATHS = ['/dashboard/products', '/dashboard/categories', '/my'] as const;

/** Admin routes that show the bottom tab bar. */
export const ADMIN_TAB_PATHS = ['/admin/restaurants', '/admin/profile'] as const;

export function isAdmin(): boolean {
  return getTokenRole() === 'admin';
}

export function isRestaurantOwner(): boolean {
  return getTokenRole() === 'restaurant_owner';
}

export function shouldShowOwnerBottomNav(pathname: string): boolean {
  return OWNER_TAB_PATHS.includes(pathname as (typeof OWNER_TAB_PATHS)[number]);
}

export function shouldShowAdminBottomNav(pathname: string): boolean {
  return ADMIN_TAB_PATHS.includes(pathname as (typeof ADMIN_TAB_PATHS)[number]);
}

/** Bottom tabs only after the user has picked a restaurant (not on the picker screen). */
export function shouldShowBottomNav(pathname: string): boolean {
  if (isAdmin()) return shouldShowAdminBottomNav(pathname);
  if (isRestaurantOwner()) return shouldShowOwnerBottomNav(pathname);
  if (pathname === '/') return false;
  if (!hasSelectedRestaurant()) return false;
  return true;
}
