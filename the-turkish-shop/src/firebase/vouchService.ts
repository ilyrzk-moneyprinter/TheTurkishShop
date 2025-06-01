import { collection, getDocs, query, doc, updateDoc, getDoc, addDoc, deleteDoc, where, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { isAdmin as checkAdmin } from './authService';

const VOUCHES_COLLECTION = 'vouches';

// Vouch status types
export type VouchStatus = 'pending' | 'approved' | 'rejected';

// Verification types
export type VerificationType = 'email' | 'purchase' | 'social' | 'phone' | 'none';

/**
 * Interface for vouch/testimonial
 */
export interface Vouch {
  id: string;
  // Basic Info
  name: string;
  email?: string;
  profilePicture?: string; // URL to profile picture
  
  // Location
  country?: string;
  city?: string;
  countryCode?: string; // e.g., "US", "GB", "TR"
  
  // Purchase Details
  productPurchased?: string;
  orderNumber?: string;
  purchaseDate?: any;
  purchaseAmount?: number;
  currency?: string;
  
  // Review Details
  platform?: string;
  rating: number;
  message: string;
  
  // Images/Screenshots
  purchaseScreenshot?: string; // URL to purchase proof screenshot
  additionalImages?: string[]; // Array of URLs for additional images
  
  // Social Media
  discordUsername?: string;
  instagramHandle?: string;
  twitterHandle?: string;
  
  // Verification
  verificationMethod?: VerificationType;
  isVerifiedPurchase?: boolean;
  verificationDate?: any;
  
  // Status
  status: VouchStatus;
  createdAt: any;
  updatedAt?: any;
  isManual?: boolean;
}

/**
 * Get all vouches/testimonials (admin only)
 */
export const getAllVouches = async (): Promise<Vouch[]> => {
  try {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const vouchesQuery = query(
    collection(db, VOUCHES_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(vouchesQuery);
    
    // Return empty array if no vouches exist
    if (querySnapshot.empty) {
      console.log('No vouches found in database');
      return [];
    }
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id,
      ...data,
    } as Vouch;
  });
  } catch (error: any) {
    console.error('Error fetching vouches:', error);
    
    // Check if it's a permissions error
    if (error.code === 'permission-denied') {
      throw new Error('You do not have permission to view vouches. Please sign in as an admin.');
    }
    
    // If the error is because the orderBy field doesn't exist, try without ordering
    if (error.message && error.message.includes('orderBy')) {
      try {
        const vouchesQuery = query(collection(db, VOUCHES_COLLECTION));
        const querySnapshot = await getDocs(vouchesQuery);
        
        if (querySnapshot.empty) {
          return [];
        }
        
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vouch));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
      }
    }
    
    throw error;
  }
};

/**
 * Get approved vouches for public display
 */
export const getApprovedVouches = async (): Promise<Vouch[]> => {
  try {
    const vouchesQuery = query(
      collection(db, VOUCHES_COLLECTION),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(vouchesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id,
        ...data,
      } as Vouch;
    });
  } catch (error: any) {
    console.error('Error fetching approved vouches:', error);
    
    // If the error is about a missing index, try without ordering
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.log('Falling back to simple query without ordering...');
      try {
        const vouchesQuery = query(
          collection(db, VOUCHES_COLLECTION),
          where('status', '==', 'approved')
        );
        const querySnapshot = await getDocs(vouchesQuery);
        
        // Manually sort by createdAt
        const vouches = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Vouch));
        
        // Sort by createdAt if it exists
        return vouches.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
          const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        // Last resort: get all vouches and filter manually
        try {
          const allVouchesQuery = query(collection(db, VOUCHES_COLLECTION));
          const querySnapshot = await getDocs(allVouchesQuery);
          
          const vouches = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Vouch))
            .filter(vouch => vouch.status === 'approved')
            .sort((a, b) => {
              const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
              const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
              return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
          
          return vouches;
        } catch (lastError) {
          console.error('Unable to fetch vouches:', lastError);
          return [];
        }
      }
    }
    
    throw error;
  }
};

/**
 * Update vouch status (admin only)
 */
export const updateVouchStatus = async (id: string, status: VouchStatus): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Validate status
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    throw new Error('Invalid status value');
  }
  
  const vouchRef = doc(db, VOUCHES_COLLECTION, id);
  await updateDoc(vouchRef, {
    status,
    updatedAt: serverTimestamp()
  });
  
  return true;
};

/**
 * Delete a vouch (admin only)
 */
export const deleteVouch = async (id: string): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const vouchRef = doc(db, VOUCHES_COLLECTION, id);
  await deleteDoc(vouchRef);
  return true;
};

/**
 * Add manual vouch (admin only)
 */
export const addManualVouch = async (vouchData: Omit<Vouch, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Validate data
  if (!vouchData.name || !vouchData.message) {
    throw new Error('Name and message are required fields');
  }
  
  // Ensure valid rating
  const rating = Number(vouchData.rating);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Build the new vouch object, filtering out undefined values
  const newVouch: any = {
    // Basic Info
    name: vouchData.name,
    // Review Details
    platform: vouchData.platform || 'Website',
    rating,
    message: vouchData.message,
    // Status
    isManual: true,
    status: vouchData.status || 'approved',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  // Add optional fields only if they have values
  if (vouchData.email) newVouch.email = vouchData.email;
  if (vouchData.profilePicture) newVouch.profilePicture = vouchData.profilePicture;
  
  // Location
  if (vouchData.country) newVouch.country = vouchData.country;
  if (vouchData.city) newVouch.city = vouchData.city;
  if (vouchData.countryCode) newVouch.countryCode = vouchData.countryCode;
  
  // Purchase Details
  if (vouchData.productPurchased) newVouch.productPurchased = vouchData.productPurchased;
  if (vouchData.orderNumber) newVouch.orderNumber = vouchData.orderNumber;
  if (vouchData.purchaseDate && typeof vouchData.purchaseDate === 'string') {
    // Convert date string to timestamp if it's a valid date
    const date = new Date(vouchData.purchaseDate);
    if (!isNaN(date.getTime())) {
      newVouch.purchaseDate = Timestamp.fromDate(date);
    }
  }
  if (vouchData.purchaseAmount) newVouch.purchaseAmount = vouchData.purchaseAmount;
  if (vouchData.currency) newVouch.currency = vouchData.currency;
  
  // Images/Screenshots
  if (vouchData.purchaseScreenshot) newVouch.purchaseScreenshot = vouchData.purchaseScreenshot;
  if (vouchData.additionalImages && vouchData.additionalImages.length > 0) {
    newVouch.additionalImages = vouchData.additionalImages;
  }
  
  // Social Media
  if (vouchData.discordUsername) newVouch.discordUsername = vouchData.discordUsername;
  if (vouchData.instagramHandle) newVouch.instagramHandle = vouchData.instagramHandle;
  if (vouchData.twitterHandle) newVouch.twitterHandle = vouchData.twitterHandle;
  
  // Verification
  if (vouchData.verificationMethod && vouchData.verificationMethod !== 'none') {
    newVouch.verificationMethod = vouchData.verificationMethod;
  }
  if (vouchData.isVerifiedPurchase) newVouch.isVerifiedPurchase = vouchData.isVerifiedPurchase;
  if (vouchData.verificationDate && typeof vouchData.verificationDate === 'string') {
    // Convert date string to timestamp if it's a valid date
    const date = new Date(vouchData.verificationDate);
    if (!isNaN(date.getTime())) {
      newVouch.verificationDate = Timestamp.fromDate(date);
    }
  }
  
  const docRef = await addDoc(collection(db, VOUCHES_COLLECTION), newVouch);
  
  // Send Discord notification for new vouches
  if (vouchData.status === 'approved') {
    await sendVouchToDiscord({
      ...vouchData,
      id: docRef.id,
      createdAt: new Date()
    });
  }
  
  return docRef.id;
};

/**
 * Submit a new vouch/testimonial (public)
 */
export const submitVouch = async (name: string, email: string, message: string, rating: number): Promise<string> => {
  // Validate data
  if (!name || !message) {
    throw new Error('Name and message are required');
  }
  
  // Ensure valid rating
  if (isNaN(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  const newVouch = {
    name,
    email,
    message,
    rating,
    status: 'pending',
    platform: 'Website',
    isManual: false,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, VOUCHES_COLLECTION), newVouch);
  return docRef.id;
};

/**
 * Submit a customer vouch linked to an order
 * Validates that the order exists and belongs to the customer
 */
export const submitCustomerVouch = async (vouchData: {
  orderNumber: string;
  email: string;
  name: string;
  message: string;
  rating: number;
  profilePicture?: string;
  country?: string;
  city?: string;
}) => {
  // Validate required fields
  if (!vouchData.orderNumber || !vouchData.email || !vouchData.name || !vouchData.message) {
    throw new Error('Order number, email, name, and message are required');
  }

  // Validate rating
  if (isNaN(vouchData.rating) || vouchData.rating < 1 || vouchData.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Validate order exists and belongs to the customer
  const orderQuery = query(
    collection(db, 'orders'),
    where('orderID', '==', vouchData.orderNumber)
  );
  const orderSnapshot = await getDocs(orderQuery);

  if (orderSnapshot.empty) {
    throw new Error('Invalid order number. Please enter a valid order ID.');
  }

  const order = orderSnapshot.docs[0].data();
  
  // Verify the email matches the order
  if (order.buyerEmail?.toLowerCase() !== vouchData.email.toLowerCase()) {
    throw new Error('The email address does not match the order. Please use the email associated with your order.');
  }

  // Check if order is delivered
  if (order.status !== 'delivered') {
    throw new Error('You can only submit a review for delivered orders.');
  }

  // Check if a vouch already exists for this order
  const existingVouchQuery = query(
    collection(db, VOUCHES_COLLECTION),
    where('orderNumber', '==', vouchData.orderNumber)
  );
  const existingVouchSnapshot = await getDocs(existingVouchQuery);

  if (!existingVouchSnapshot.empty) {
    throw new Error('A review has already been submitted for this order.');
  }

  // Create the vouch
  const newVouch = {
    // Basic Info
    name: vouchData.name,
    email: vouchData.email,
    profilePicture: vouchData.profilePicture,
    
    // Location
    country: vouchData.country,
    city: vouchData.city,
    
    // Purchase Details
    productPurchased: order.productType || order.items?.[0]?.name || 'Product',
    orderNumber: vouchData.orderNumber,
    purchaseDate: order.createdAt,
    purchaseAmount: order.totalAmount || order.items?.[0]?.price,
    currency: order.currency || 'USD',
    
    // Review Details
    platform: 'Website',
    rating: vouchData.rating,
    message: vouchData.message,
    
    // Verification
    verificationMethod: 'purchase' as VerificationType,
    isVerifiedPurchase: true,
    verificationDate: serverTimestamp(),
    
    // Status
    status: 'pending' as VouchStatus,
    isManual: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, VOUCHES_COLLECTION), newVouch);
  return docRef.id;
};

/**
 * Check if a customer can submit a vouch for an order
 */
export const canSubmitVouch = async (orderNumber: string, email: string): Promise<{
  canSubmit: boolean;
  reason?: string;
}> => {
  try {
    // Check if order exists
    const orderQuery = query(
      collection(db, 'orders'),
      where('orderID', '==', orderNumber)
    );
    const orderSnapshot = await getDocs(orderQuery);

    if (orderSnapshot.empty) {
      return { canSubmit: false, reason: 'Order not found' };
    }

    const order = orderSnapshot.docs[0].data();
    
    // Verify email matches
    if (order.buyerEmail?.toLowerCase() !== email.toLowerCase()) {
      return { canSubmit: false, reason: 'Email does not match order' };
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return { canSubmit: false, reason: 'Order not yet delivered' };
    }

    // Check if vouch already exists
    const existingVouchQuery = query(
      collection(db, VOUCHES_COLLECTION),
      where('orderNumber', '==', orderNumber)
    );
    const existingVouchSnapshot = await getDocs(existingVouchQuery);

    if (!existingVouchSnapshot.empty) {
      return { canSubmit: false, reason: 'Review already submitted' };
    }

    return { canSubmit: true };
  } catch (error) {
    console.error('Error checking vouch eligibility:', error);
    return { canSubmit: false, reason: 'Error checking eligibility' };
  }
};

/**
 * Send vouch notification to Discord webhook
 */
const sendVouchToDiscord = async (vouch: Vouch) => {
  const webhookUrl = process.env.REACT_APP_DISCORD_VOUCH_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Discord webhook URL not configured for vouches');
    return;
  }
  
  try {
    const embed = {
      title: '⭐ New Customer Review',
      color: 0x00ff00, // Green color
      fields: [
        {
          name: 'Customer',
          value: vouch.name,
          inline: true
        },
        {
          name: 'Rating',
          value: '⭐'.repeat(vouch.rating),
          inline: true
        },
        {
          name: 'Product',
          value: vouch.productPurchased || 'General',
          inline: true
        },
        {
          name: 'Review',
          value: vouch.message.length > 1024 ? vouch.message.substring(0, 1021) + '...' : vouch.message,
          inline: false
        }
      ],
      footer: {
        text: 'The Turkish Shop'
      },
      timestamp: new Date().toISOString()
    };
    
    // Add location if available
    if (vouch.city || vouch.country) {
      embed.fields.push({
        name: 'Location',
        value: [vouch.city, vouch.country].filter(Boolean).join(', '),
        inline: true
      });
    }
    
    // Add verification status
    if (vouch.isVerifiedPurchase) {
      embed.fields.push({
        name: 'Status',
        value: '✅ Verified Purchase',
        inline: true
      });
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });
    
    if (!response.ok) {
      console.error('Failed to send vouch to Discord:', response.statusText);
    }
  } catch (error) {
    console.error('Error sending vouch to Discord:', error);
  }
};

/**
 * Debug function to get all vouches regardless of status
 * This is for debugging purposes only
 */
export const debugGetAllVouches = async (): Promise<Vouch[]> => {
  try {
    console.log('Debug: Fetching all vouches from database...');
    const vouchesQuery = query(collection(db, VOUCHES_COLLECTION));
    const querySnapshot = await getDocs(vouchesQuery);
    
    console.log(`Debug: Found ${querySnapshot.size} vouches in database`);
    
    const vouches = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Debug: Vouch ${doc.id}:`, {
        name: data.name,
        status: data.status,
        createdAt: data.createdAt,
        message: data.message?.substring(0, 50) + '...'
      });
      return {
        id: doc.id,
        ...data
      } as Vouch;
    });
    
    return vouches;
  } catch (error) {
    console.error('Debug: Error fetching all vouches:', error);
    return [];
  }
}; 