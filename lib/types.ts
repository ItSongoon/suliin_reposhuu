export interface User {
  id: string;
  registerNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  registerNumber: string; // 7 digits
  password: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  openTime: string;
  closeTime: string;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  openTime: string;
  closeTime: string;
  phone: string;
  image: string;
  distance?: number;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  store: Store;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  storeAddress: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled' | 'penalty';
  createdAt: string;
  pickupTime: string;
  pickupDate: string;
  qrCode: string;
  missedPickups: number; // 3 удаа авахгүй бол торгууль
  penaltyAmount: number; // 50% торгууль
  isPenaltyPaid: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export type TransportType = 'walk' | 'bike' | 'bus' | 'car';

export interface ScheduleItem {
  id: string;
  location: Location;
  name: string;
  time: string;
  duration: number;
  transport: TransportType;
  cost: number;
}

export interface DailyPlan {
  id: string;
  userId: string;
  date: string;
  budget: number;
  transport: TransportType;
  items: ScheduleItem[];
  totalCost: number;
  totalTime: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface StoreRating {
  id: string;
  storeId: string;
  userId: string;
  rating: number; // 0 to 5
  createdAt: string;
}
