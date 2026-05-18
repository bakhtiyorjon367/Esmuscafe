/** Fired when admin taps Add restaurant while already on the restaurants page. */
export const ADMIN_OPEN_ADD_RESTAURANT = 'admin:open-add-restaurant';

export function dispatchAdminOpenAddRestaurant(): void {
  window.dispatchEvent(new CustomEvent(ADMIN_OPEN_ADD_RESTAURANT));
}

export function listenAdminOpenAddRestaurant(handler: () => void): () => void {
  window.addEventListener(ADMIN_OPEN_ADD_RESTAURANT, handler);
  return () => window.removeEventListener(ADMIN_OPEN_ADD_RESTAURANT, handler);
}
