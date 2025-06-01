import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the CartItem interface
export interface CartItem {
  id: string;
  productId?: string; // Optional field for Fortnite and Valorant
  name: string;
  tierName?: string; // Optional field for tier display names
  type: string;
  amount: string;
  price: number;
  quantity: number;
  image: string;
  gameDetails?: {
    originalUrl?: string;
    platform?: string;
    userEmail?: string;
    message?: string;
    originalPrice?: number;
    imageUrl?: string;
    productType?: string;
    [key: string]: any;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// LocalStorage key
const CART_STORAGE_KEY = 'turkishShop_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  // Add item to cart
  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(currentItems => {
      // Check if item already exists in cart
      const existingItemIndex = currentItems.findIndex(item => item.id === newItem.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, increment quantity
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      } else {
        // Item doesn't exist, add new item with quantity 1
        return [...currentItems, { ...newItem, quantity: 1 }];
      }
    });
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
  };
  
  // Calculate total number of items
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  
  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );
  
  // Calculate total (add any discounts, shipping costs, etc. here)
  const total = subtotal;
  
  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    total
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 