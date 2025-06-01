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