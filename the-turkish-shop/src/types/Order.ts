// Basic Order type definition
export interface Order {
  orderID: string;
  buyerEmail: string;
  status: string;
  price?: number;
  totalPrice?: number;
  paymentMethod?: string;
  deliveryType?: string;
  deliveryMethod?: string;
  product?: string;
  tier?: string;
  items?: Array<{
    product: string;
    amount: string | number;
    price: number;
    quantity: number;
  }>;
  createdAt: any; // Using any type for flexibility
} 