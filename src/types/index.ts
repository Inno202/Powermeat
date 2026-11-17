export type Role = 'owner' | 'manager' | 'counter' | 'driver';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export type PricingType = 'fixed' | 'per_kg' | 'per_bag' | 'per_bucket';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'hidden';

export interface HamperItem {
  id: string;
  name: string;
  quantity: number;
  packSize: string; // e.g. "500g", "1kg"
  weightKg: number; // calculated e.g. 0.5 * 4 = 2kg
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string; // e.g. 'Meat Combos', 'Family Hampers', 'Bulk Meat'
  subCategory?: string;
  sku: string;
  description: string;
  pricingType: PricingType;
  price: number; // in ZAR
  originalPrice?: number; // for crossed-out special pricing
  weightKg?: number; // total weight in kg (for hampers and combos)
  isFreeDelivery: boolean;
  stockStatus: StockStatus;
  sortOrder: number;
  tags: string[];
  imageUrl?: string;
  images?: string[];
  hamperItems?: HamperItem[]; // "What's inside" breakdown
  options?: string[]; // e.g. ["Whole", "Sliced"] for Pork Knuckle
  isSpecial?: boolean;
  specialLabel?: string;
  specialEndDate?: string; // ISO date string
}

export interface SpecialCampaign {
  id: string;
  title: string;
  label: string; // e.g. "Month End Special", "While Stock Lasts"
  startDate: string;
  endDate?: string;
  active: boolean;
  productIds: string[];
  bannerUrl?: string;
  description?: string;
}

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'packing'
  | 'ready_for_collection'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';

export type DeliveryType = 'delivery' | 'collection';

export type PaymentMethod = 'cod' | 'eft' | 'online_card';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type OrderSource = 'web' | 'whatsapp' | 'phone' | 'walk_in';

export interface OrderItem {
  productId: string;
  name: string;
  category: string;
  pricingType: PricingType;
  unitPrice: number;
  quantity: number; // units or kg
  weightKg?: number;
  selectedOption?: string;
  actualWeightKg?: number; // weighed by counter staff
  adjustedPrice?: number; // adjusted total for per-kg lines
  lineTotal: number;
  notes?: string;
}

export interface Order {
  id: string; // PM-000123
  customerName: string;
  customerCell: string;
  customerEmail?: string;
  deliveryType: DeliveryType;
  area: string;
  deliveryAddress?: string;
  deliveryDate: string; // YYYY-MM-DD
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  source: OrderSource;
  notes?: string;
  marketingOptIn: boolean;
  popUrl?: string; // proof of payment data / URL
  assignedDriverId?: string;
  driverNotes?: string;
  cashCollected?: number;
  weighAdjustReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryArea {
  id: string;
  name: string;
  days: string[]; // e.g. ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  fee: number; // 0 for free
  freeHamperThreshold: boolean; // if true, Family Hampers & Meat Combos get free delivery
  active: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  details: string;
  timestamp: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  address: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  tradingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
    publicHolidays: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  announcementBarText: string;
  announcementBarActive: boolean;
  cutoffTime: string; // e.g. "12:00"
  onlinePaymentEnabled: boolean; // toggled off by default
  blockedDates: string[]; // YYYY-MM-DD
}

/** An Owner's invitation for a person to join the staff with a given role. */
export interface StaffInvite {
  id: string; // the invited email, lower case
  email: string;
  name: string;
  phone?: string;
  role: Role;
  invitedBy: string;
  createdAt: string;
}
