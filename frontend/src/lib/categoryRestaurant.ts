const STORAGE_KEY = 'esmuscafe_category_restaurant';

export function setCategoryRestaurantId(id: string): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, id);
  }
}

export function getCategoryRestaurantId(): string | null {
  if (typeof sessionStorage === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearCategoryRestaurantId(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function hasSelectedRestaurant(): boolean {
  return !!getCategoryRestaurantId();
}
