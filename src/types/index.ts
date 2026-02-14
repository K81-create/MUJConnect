export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  rating: number;
  reviewCount: number;
  category: "women" | "men" | "repair" | "cleaning" | "painting" | "pest-control" | "water-tank";
  image: string;
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface CartItem {
  service: Service;
  selectedAddOns: AddOn[];
  quantity: number;
}

export interface Booking {
  address: string;
  date: Date | null;
  time: string;
  items: CartItem[];
  paymentMethod?: 'cod' | 'qr';
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}
