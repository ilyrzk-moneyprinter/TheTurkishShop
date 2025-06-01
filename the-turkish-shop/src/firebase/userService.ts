import { collection, getDocs, query, where, doc, updateDoc, getDoc, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { isAdmin as checkAdmin } from './authService';

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async () => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const usersQuery = query(collection(db, USERS_COLLECTION));
  const querySnapshot = await getDocs(usersQuery);
  
  // Get users data
  const users = await Promise.all(querySnapshot.docs.map(async (userDoc) => {
    const userData = userDoc.data();
    
    // Count orders for each user
    const orderQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('buyerEmail', '==', userData.email)
    );
    const orderSnapshot = await getDocs(orderQuery);
    
    return {
      uid: userDoc.id,
      email: userData.email || '',
      displayName: userData.displayName || '',
      role: userData.role || 'user',
      createdAt: userData.createdAt || null,
      lastLogin: userData.lastLogin || null,
      benefits: userData.benefits || [],
      orderCount: orderSnapshot.size
    };
  }));
  
  return users;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (uid: string, role: string) => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Validate role
  if (!['admin', 'user'].includes(role)) {
    throw new Error('Invalid role. Must be "admin" or "user"');
  }
  
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { role });
  
  return true;
};

/**
 * Assign benefit to user (admin only)
 */
export const assignBenefit = async (uid: string, benefit: string) => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Get current user data
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userSnap.data();
  const currentBenefits = userData.benefits || [];
  
  // Check if benefit already exists
  if (currentBenefits.includes(benefit)) {
    throw new Error('User already has this benefit');
  }
  
  // Add new benefit
  const updatedBenefits = [...currentBenefits, benefit];
  await updateDoc(userRef, { 
    benefits: updatedBenefits,
    updatedAt: Timestamp.now()
  });
  
  return true;
};

/**
 * Get user orders (admin only)
 */
export const getUserOrders = async (email: string) => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('buyerEmail', '==', email),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(ordersQuery);
  return querySnapshot.docs.map(doc => doc.data());
};

/**
 * Remove benefit from user (admin only)
 */
export const removeBenefit = async (uid: string, benefit: string) => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Get current user data
  const userRef = doc(db, USERS_COLLECTION, uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userSnap.data();
  const currentBenefits = userData.benefits || [];
  
  // Remove benefit
  const updatedBenefits = currentBenefits.filter((b: string) => b !== benefit);
  await updateDoc(userRef, { 
    benefits: updatedBenefits,
    updatedAt: Timestamp.now()
  });
  
  return true;
};

/**
 * Update user game profiles (usernames)
 */
export const updateUserGameProfiles = async (uid: string, gameProfiles: Record<string, string>) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { 
    gameProfiles,
    updatedAt: Timestamp.now()
  });
  
  return true;
};

/**
 * Get total user count
 */
export const getUserCount = async (): Promise<number> => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.size;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
}; 