export interface WorkingHours {
  open: string;
  close: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  image: string;
  address?: string;
  /** API may return populated object; form always needs string _id */
  ownerId: string | { _id: string };
  status: 'active' | 'inactive' | 'deleted';
  isOpened: boolean;
  workingHours?: WorkingHours;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  restaurantId: string | Restaurant;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  discount: number;
  image: string;
  category: string;
  isAvailable: boolean;
  /** Minutes until product is ready (null = ready now) */
  readyAt?: number | null;
  tags?: ('suggested' | 'new')[];
  likes?: string[];
  likeCount?: number;
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  address: string;
}

export interface User {
  id: string;
  nickname: string;
  name: string;
  role: 'admin' | 'restaurant_owner' | 'user';
  restaurantId?: string;
  addresses?: UserAddress[];
}

export interface Comment {
  _id: string;
  productId: string;
  userId: string | { _id: string; nickname: string; name: string };
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string | Product;
  quantity: number;
  priceSnapshot: number;
}

export interface Cart {
  _id: string;
  userId: string;
  restaurantId: string | null;
  items: CartItem[];
}

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}
