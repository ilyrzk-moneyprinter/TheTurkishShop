import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  deleteDoc,
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';
import { PromoCode } from './types';

const PROMO_CODES_COLLECTION = 'promoCodes';

/**
 * Create a new promo code
 */
export const createPromoCode = async (promoCodeData: Omit<PromoCode, 'id' | 'usageCount' | 'createdAt'>): Promise<string> => {
  try {
    const promoCode: Omit<PromoCode, 'id'> = {
      ...promoCodeData,
      usageCount: 0,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, PROMO_CODES_COLLECTION), promoCode);
    return docRef.id;
  } catch (error) {
    console.error('Error creating promo code:', error);
    throw error;
  }
};

/**
 * Get all promo codes
 */
export const getAllPromoCodes = async (): Promise<PromoCode[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PROMO_CODES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromoCode));
  } catch (error) {
    console.error('Error getting promo codes:', error);
    throw error;
  }
};

/**
 * Get active promo codes
 */
export const getActivePromoCodes = async (): Promise<PromoCode[]> => {
  try {
    const now = Timestamp.now();
    const q = query(
      collection(db, PROMO_CODES_COLLECTION),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const promoCodes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PromoCode));
    
    // Filter by date validity
    return promoCodes.filter(promo => {
      const validFrom = promo.validFrom instanceof Timestamp ? promo.validFrom.toDate() : promo.validFrom;
      const validTo = promo.validTo instanceof Timestamp ? promo.validTo.toDate() : promo.validTo;
      const nowDate = now.toDate();
      
      return nowDate >= validFrom && nowDate <= validTo;
    });
  } catch (error) {
    console.error('Error getting active promo codes:', error);
    throw error;
  }
};

/**
 * Validate and get promo code details
 */
export const validatePromoCode = async (code: string, orderTotal: number): Promise<{
  valid: boolean;
  promoCode?: PromoCode;
  discount?: number;
  message?: string;
}> => {
  try {
    const q = query(
      collection(db, PROMO_CODES_COLLECTION),
      where('code', '==', code.toUpperCase()),
      where('active', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { valid: false, message: 'Invalid promo code' };
    }
    
    const promoData = querySnapshot.docs[0].data() as PromoCode;
    const promoId = querySnapshot.docs[0].id;
    const promo = { ...promoData, id: promoId };
    
    // Check validity dates
    const now = new Date();
    const validFrom = promo.validFrom instanceof Timestamp ? promo.validFrom.toDate() : promo.validFrom;
    const validTo = promo.validTo instanceof Timestamp ? promo.validTo.toDate() : promo.validTo;
    
    if (now < validFrom || now > validTo) {
      return { valid: false, message: 'Promo code has expired' };
    }
    
    // Check usage limit
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }
    
    // Check minimum purchase
    if (promo.minPurchase && orderTotal < promo.minPurchase) {
      return { valid: false, message: `Minimum purchase of £${promo.minPurchase} required` };
    }
    
    // Calculate discount
    let discount = 0;
    if (promo.type === 'percentage') {
      discount = (orderTotal * promo.value) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.value;
    }
    
    // Ensure discount doesn't exceed order total
    discount = Math.min(discount, orderTotal);
    
    return { valid: true, promoCode: promo, discount };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return { valid: false, message: 'Error validating promo code' };
  }
};

/**
 * Increment usage count for a promo code
 */
export const usePromoCode = async (promoId: string): Promise<void> => {
  try {
    const promoRef = doc(db, PROMO_CODES_COLLECTION, promoId);
    const promoSnap = await getDoc(promoRef);
    
    if (!promoSnap.exists()) {
      throw new Error('Promo code not found');
    }
    
    const currentCount = promoSnap.data().usageCount || 0;
    
    await updateDoc(promoRef, {
      usageCount: currentCount + 1
    });
  } catch (error) {
    console.error('Error using promo code:', error);
    throw error;
  }
};

/**
 * Update a promo code
 */
export const updatePromoCode = async (promoId: string, updates: Partial<PromoCode>): Promise<void> => {
  try {
    const promoRef = doc(db, PROMO_CODES_COLLECTION, promoId);
    await updateDoc(promoRef, updates);
  } catch (error) {
    console.error('Error updating promo code:', error);
    throw error;
  }
};

/**
 * Delete a promo code
 */
export const deletePromoCode = async (promoId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PROMO_CODES_COLLECTION, promoId));
  } catch (error) {
    console.error('Error deleting promo code:', error);
    throw error;
  }
}; 