import { Timestamp } from 'firebase/firestore';

// Order status type
export type OrderStatus = 'pending' | 'Payment Verification' | 'queued' | 'in_progress' | 'delivered' | 'delayed' | 'cancelled';

// Payment method type
export type PaymentMethod = 'PayPal' | 'Paysafecard' | 'Crypto';

// Delivery type
export type DeliveryType = 'Standard' | 'Express';

// Platform type
export type GamePlatform = 'PC' | 'Xbox' | 'PlayStation' | 'Mobile' | 'Nintendo Switch';

// Product categories that don't need platform selection
export const PLATFORM_EXEMPT_PRODUCTS = [
  'Discord Nitro',
  'Spotify Premium',
  'Steam Games',
  'PlayStation Games'
];

// Payment details types
export interface PayPalDetails {
  transactionID?: string;
}

export interface PaysafecardDetails {
  country: string;
  code?: string;
}

export interface CryptoDetails {
  walletAddress?: string;
  transactionID?: string;
}

// Delivery method type
export type DeliveryMethod = 'account' | 'code' | 'direct' | 'giftcard' | 'gift_link';

// Cart order item interface
export interface CartOrderItem {
  product: string;
  amount: string;
  price: string;
  quantity: number;
}

// Order interface
export interface Order {
  orderID: string;
  product: string;
  tier: string;
  price: string;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: PayPalDetails | PaysafecardDetails | CryptoDetails;
  deliveryMethod?: DeliveryMethod;
  // New fields for queue system
  deliveryType: DeliveryType;
  queuePosition?: number;
  estimatedDeliveryTime?: Timestamp;
  // Currency display fields for currency conversion
  displayCurrency?: string;
  displayTotalPrice?: string;
  // Promo code fields
  promoCode?: string;
  promoDiscount?: number;
  promoId?: string;
  // Delivery content and status
  deliveryValue?: string;
  isExpress?: boolean;
  deliveredAt?: Date | string | number | Timestamp;
  // Other existing fields
  platform?: GamePlatform;
  buyerEmail: string;
  gameUsername: string;
  screenshotURL?: string;
  deliveryProofURL?: string; // URL to delivery proof screenshot
  status: OrderStatus;
  createdAt: Date | string | number | Timestamp;
  updatedAt?: Date | string | number | Timestamp;
  notes?: string;
  adminNotes?: string;
  country?: string;
  // Support for multi-item orders from cart
  items?: CartOrderItem[];
  totalPrice?: string;
  // Additional delivery details for game-specific options
  deliveryDetails?: Record<string, any>;
  // Email logs
  emailLog?: Array<{
    sentAt: Date | string | number | Timestamp;
    emailType: string;
    success: boolean;
    error?: string;
  }>;
}

// Order receipt form interface
export interface OrderReceiptForm {
  orderID: string;
  gameAccount: string;
  gamePassword?: string; // Optional, depending on the delivery method
  platform: string;
  additionalInfo?: string;
  contactMethod: string; // Discord, email, etc.
  contactDetails: string;
}

// User roles
export type UserRole = 'customer' | 'admin';

// User interface
export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Date | string | number | Timestamp;
}

export interface PromoCode {
  id?: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number; // percentage (0-100) or fixed amount
  minPurchase?: number;
  maxDiscount?: number; // for percentage discounts
  usageLimit?: number;
  usageCount: number;
  validFrom: Date | Timestamp;
  validTo: Date | Timestamp;
  active: boolean;
  createdAt: Date | Timestamp;
  createdBy: string;
} 