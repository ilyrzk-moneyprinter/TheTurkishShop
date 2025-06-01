// Import all necessary modules first
import { db, auth, storage } from './config';
import { 
  registerUser, 
  signInUser, 
  signOutUser, 
  getCurrentUser, 
  signInWithDiscord,
  processDiscordSignIn,
  onAuthStateChange, 
  isAdmin,
  setUserRole,
  resetPassword
} from './authService';
import {
  createOrder,
  getOrderById,
  getOrdersByEmail,
  updateOrderStatus,
  submitReceiptForm,
  uploadPaymentProof
} from './orderService';
import {
  getAllOrders,
  getOrderStats,
  searchOrders,
  processOrder,
} from './adminService';

// Export Firebase configuration
export * from './config';

// Export types
export * from './types';

// Export individual services directly to avoid circular dependencies
export * from './authService';
export * from './orderService';
export * from './adminService';

// Combined exports for convenience
export { db, storage, auth };

// Auth exports
export { 
  registerUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  signInWithDiscord,
  processDiscordSignIn,
  onAuthStateChange,
  isAdmin,
  setUserRole,
  resetPassword
};

// Order exports
export {
  createOrder,
  getOrderById,
  getOrdersByEmail,
  updateOrderStatus,
  submitReceiptForm,
  uploadPaymentProof
};

// Admin exports
export {
  getAllOrders,
  getOrderStats,
  searchOrders,
  processOrder,
}; 