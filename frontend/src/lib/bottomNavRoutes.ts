import { hasSelectedRestaurant } from './categoryRestaurant';

/** Routes where the bottom tab bar should be hidden (owner/admin stack). */
const HIDDEN_PREFIXES = ['/dashboard', '/admin'];

export function shouldHideBottomNav(pathname: string): boolean {
  return HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Bottom tabs only after the user has picked a restaurant (not on the picker screen). */
export function shouldShowBottomNav(pathname: string): boolean {
  if (shouldHideBottomNav(pathname)) return false;
  if (pathname === '/') return false;
  if (!hasSelectedRestaurant()) return false;
  return true;
}
