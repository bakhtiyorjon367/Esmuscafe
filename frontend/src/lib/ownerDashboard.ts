/** Fired when the owner taps Add product while already on the dashboard. */
export const OWNER_OPEN_ADD_PRODUCT = 'owner:open-add-product';

export function dispatchOwnerOpenAddProduct(): void {
  window.dispatchEvent(new CustomEvent(OWNER_OPEN_ADD_PRODUCT));
}

export function listenOwnerOpenAddProduct(handler: () => void): () => void {
  window.addEventListener(OWNER_OPEN_ADD_PRODUCT, handler);
  return () => window.removeEventListener(OWNER_OPEN_ADD_PRODUCT, handler);
}
