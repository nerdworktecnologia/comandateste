export type AppRole = 'customer' | 'company_owner' | 'company_staff' | 'delivery_driver' | 'admin';

export type CompanyStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';

export type CategoryType = 'supermarket' | 'pharmacy' | 'cosmetics' | 'drinks' | 'petshop' | 'restaurant' | 'other';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  category_type: CategoryType;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Store {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  city: string;
  state: string;
  zip_code: string | null;
  latitude: number | null;
  longitude: number | null;
  category_id: string | null;
  status: CompanyStatus;
  is_featured: boolean;
  is_open: boolean;
  opening_hours: Record<string, unknown> | null;
  delivery_fee: number;
  min_order_value: number;
  avg_delivery_time: number;
  rating: number;
  total_reviews: number;
  contract_accepted: boolean;
  contract_accepted_at: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percent: number;
  image_url: string | null;
  sku: string | null;
  stock_quantity: number;
  is_available: boolean;
  expiry_date: string | null;
  requires_prescription: boolean;
  pharmaceutical_warning: string | null;
  sales_count: number;
  created_at: string;
  updated_at: string;
  store?: Store;
  category?: Category;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  store_id: string;
  driver_id: string | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_zip: string | null;
  delivery_notes: string | null;
  payment_method: string | null;
  payment_status: string;
  estimated_delivery_time: string | null;
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  store?: Store;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  rating: number;
  comment: string | null;
  store_reply: string | null;
  created_at: string;
}

export interface SlideContent {
  id: number;
  title: string;
  description: string;
  image?: string;
  bgColor: string;
}
