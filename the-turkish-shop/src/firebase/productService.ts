import { collection, getDocs, query, doc, updateDoc, getDoc, addDoc, deleteDoc, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './config';
import { isAdmin as checkAdmin } from './authService';
import { v4 as uuidv4 } from 'uuid';

const PRODUCTS_COLLECTION = 'products';

/**
 * Product types
 */
export type ProductType = 'subscription' | 'game' | 'currency' | 'other';

/**
 * Product categories
 */
export type ProductCategory = 
  | 'streaming' 
  | 'gaming' 
  | 'software' 
  | 'steam' 
  | 'playstation' 
  | 'xbox' 
  | 'nintendo' 
  | 'mobile' 
  | 'gift-card'
  | 'in-game-currency'
  | 'other';

/**
 * Platform types
 */
export type PlatformType = 
  | 'steam' 
  | 'playstation' 
  | 'xbox' 
  | 'nintendo' 
  | 'epic' 
  | 'origin' 
  | 'uplay' 
  | 'discord' 
  | 'spotify'
  | 'netflix'
  | 'twitch'
  | 'mobile'
  | 'web'
  | 'other';

/**
 * Delivery method types
 */
export type DeliveryMethod = 'instant' | 'manual' | 'email' | 'account';

/**
 * Interface for product tier
 */
export interface ProductTier {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For showing discounts
  description: string;
  duration?: string; // For subscriptions (e.g., "1 month", "3 months", "1 year")
  amount?: string; // For currency (e.g., "1000 Robux", "$10 Gift Card")
  features?: string[]; // List of features included
  inStock: boolean;
  stockCount?: number; // Actual stock count if tracked
  maxQuantity?: number; // Max quantity per order
}

/**
 * Interface for product
 */
export interface Product {
  id: string;
  // Basic Info
  name: string;
  description: string;
  shortDescription?: string;
  imageURL: string;
  gallery?: string[]; // Additional images
  
  // Categorization
  type: ProductType;
  category: ProductCategory;
  platform?: PlatformType;
  tags?: string[];
  
  // Pricing & Availability
  tiers: ProductTier[];
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  
  // Delivery
  deliveryMethod: DeliveryMethod;
  deliveryTime?: string; // e.g., "Instant", "Within 24 hours"
  deliveryInstructions?: string;
  
  // Platform Specific
  region?: string; // For region-locked products
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
  
  // Additional Info
  ageRating?: string;
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  
  // SEO & Display
  slug?: string; // URL-friendly name
  metaTitle?: string;
  metaDescription?: string;
  displayOrder?: number; // For custom ordering
  
  // Admin
  notes?: string; // Internal notes
  createdAt: any;
  updatedAt?: any;
  createdBy?: string; // Admin who created
  updatedBy?: string; // Admin who last updated
}

/**
 * Get all products
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
  const productsQuery = query(collection(db, PRODUCTS_COLLECTION));
  const querySnapshot = await getDocs(productsQuery);
    
    // Return empty array if no products exist
    if (querySnapshot.empty) {
      console.log('No products found in database');
      return [];
    }
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id,
      ...data,
    } as Product;
  });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    
    // Check if it's a permissions error
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to view products. Please sign in as an admin.');
    }
    
    throw new Error(`Failed to load products: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  const productSnap = await getDoc(productRef);
  
  if (!productSnap.exists()) {
    return null;
  }
  
  return { 
    id: productSnap.id,
    ...productSnap.data()
  } as Product;
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (): Promise<Product[]> => {
  const productsQuery = query(
    collection(db, PRODUCTS_COLLECTION), 
    where('featured', '==', true),
    where('inStock', '==', true)
  );
  const querySnapshot = await getDocs(productsQuery);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id,
      ...data,
    } as Product;
  });
};

/**
 * Create a new product (admin only)
 */
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const productData = {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
  return docRef.id;
};

/**
 * Update an existing product (admin only)
 */
export const updateProduct = async (product: Product): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const { id, ...productData } = product;
  
  const productRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp()
  });
  
  return true;
};

/**
 * Delete a product (admin only)
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const productRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(productRef);
  return true;
};

/**
 * Upload a product image to storage (admin only)
 */
export const uploadProductImage = async (file: File, productName: string): Promise<string> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // File size validation
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    throw new Error('File size too large. Maximum size is 5MB.');
  }
  
  // File type validation
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.');
  }
  
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const filename = `${productName.replace(/[^a-zA-Z0-9]/g, '_')}_${uuidv4()}.${fileExtension}`;
    
    // Upload to Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `products/${filename}`);
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}; 