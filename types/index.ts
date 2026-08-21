export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'banned' | 'suspended';

export interface User {
  id: string;
  minecraft_nick: string;
  minecraft_uuid: string | null;
  credit_balance: number;
  role: UserRole;
  account_status: AccountStatus;
  created_at: string;
}

export type ProductCategory =
  | 'vip' | 'rutbe' | 'kit' | 'kasa_anahtari' | 'kredi' | 'kozmetik' | 'ozel';

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  description: string | null;
  benefits: string[];
  image_url: string | null;
  old_price: number | null;
  price: number;
  credit_price: number | null;
  discount_percent: number;
  delivery_command: string | null;
  is_active: boolean;
}

export type OrderStatus =
  | 'pending' | 'awaiting_payment' | 'paid' | 'processing'
  | 'delivered' | 'failed' | 'refunded';

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_price: number;
  total_credits: number | null;
  payment_method: 'card' | 'credit_balance' | null;
  created_at: string;
}

export type DeliveryStatus = 'pending' | 'processing' | 'delivered' | 'failed';

export interface Delivery {
  id: string;
  order_item_id: string;
  user_id: string;
  command: string;
  status: DeliveryStatus;
  attempts: number;
  last_error: string | null;
}
