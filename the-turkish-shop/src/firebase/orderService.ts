import { collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, orderBy, limit as firestoreLimit, Timestamp, onSnapshot, writeBatch, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from './config';
import { Order, OrderStatus, DeliveryType } from './types';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { sendOrderConfirmation, sendOrderInProgress, sendOrderCancelled, sendOrderDelayed, sendOrderDelivered } from '../services/emailService';

const ORDERS_COLLECTION = 'orders';
const RECEIPT_FORMS_COLLECTION = 'receiptForms';

/**
 * Calculate estimated delivery time based on delivery type
 */
export const calculateEstimatedDeliveryTime = (deliveryType: DeliveryType, queuePosition: number): Timestamp => {
  const now = new Date();
  
  if (deliveryType === 'Express') {
    // Express delivery: 5-60 minutes
    now.setMinutes(now.getMinutes() + 60);
  } else {
    // Standard delivery: 1-3 days
    now.setDate(now.getDate() + 3);
  }
  
  return Timestamp.fromDate(now);
};

/**
 * Get the next available queue position
 * Separate queues for Express and Standard orders
 */
export const getNextQueuePosition = async (): Promise<number> => {
  // Express orders always come before Standard orders
  // We'll get the highest queue position for all orders first
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('status', 'in', ['queued', 'in_progress']), // Only consider active orders
    orderBy('queuePosition', 'desc'),
    firestoreLimit(1)
  );
  
  const querySnapshot = await getDocs(ordersQuery);
  
  if (querySnapshot.empty) {
    return 1; // First order in the queue
  }
  
  const highestPosition = querySnapshot.docs[0].data().queuePosition || 0;
  
  return highestPosition + 1;
};

/**
 * Reorder the queue to insert an Express order at the front
 */
const reorderQueueForExpress = async (highestPosition: number): Promise<void> => {
  try {
    // Get Standard orders with queued status
    const queuedStandardOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('deliveryType', '==', 'Standard'),
      where('status', '==', 'queued')
    );
    
    // Get Standard orders with in_progress status
    const inProgressStandardOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('deliveryType', '==', 'Standard'),
      where('status', '==', 'in_progress')
    );
    
    // Execute both queries
    const [queuedSnapshot, inProgressSnapshot] = await Promise.all([
      getDocs(queuedStandardOrdersQuery),
      getDocs(inProgressStandardOrdersQuery)
    ]);
    
    // Check if there are any orders to reorder
    if (queuedSnapshot.empty && inProgressSnapshot.empty) {
      return; // No Standard orders to reorder
    }
    
    // Use a batch to update all positions atomically
    const batch = writeBatch(db);
    
    // Process queued Standard orders
    queuedSnapshot.docs.forEach(orderDoc => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderDoc.id);
      const currentPosition = orderDoc.data().queuePosition || 0;
      batch.update(orderRef, { 
        queuePosition: currentPosition + 1,
        updatedAt: Timestamp.now()
      });
    });
    
    // Process in_progress Standard orders
    inProgressSnapshot.docs.forEach(orderDoc => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderDoc.id);
      const currentPosition = orderDoc.data().queuePosition || 0;
      batch.update(orderRef, { 
        queuePosition: currentPosition + 1,
        updatedAt: Timestamp.now()
      });
    });
    
    // Commit all updates
    await batch.commit();
  } catch (error) {
    console.error('Error reordering queue for Express:', error);
    // Continue execution rather than throwing, as this is a non-critical operation
  }
};

/**
 * Create a new order in Firestore
 */
export const createOrder = async (orderData: Omit<Order, 'orderID' | 'status' | 'createdAt' | 'queuePosition' | 'estimatedDeliveryTime'>): Promise<string> => {
  try {
    const queuePosition = await getNextQueuePosition();
    const estimatedDeliveryTime = calculateEstimatedDeliveryTime(orderData.deliveryType || 'Standard', queuePosition);

    const orderID = uuidv4();
    const order: Order = {
      ...orderData,
      orderID,
      status: 'Payment Verification',
      createdAt: Timestamp.now(),
      queuePosition,
      estimatedDeliveryTime
    };

    await setDoc(doc(db, ORDERS_COLLECTION, orderID), order);
    
    // Send order confirmation email
    try {
      await sendOrderConfirmation({
        ...order,
        createdAt: new Date()
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }
    
    // Discord notification removed
    
    return orderID;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Save a payment screenshot to Firebase Storage and update the order
 * This accepts either an external URL or a File
 */
export const uploadPaymentProof = async (orderID: string, imageData: string | File): Promise<string> => {
  let retryCount = 0;
  const MAX_RETRIES = 2;
  
  while (retryCount <= MAX_RETRIES) {
    try {
      let screenshotURL = '';
      console.log(`uploadPaymentProof attempt ${retryCount + 1} for orderID:`, orderID);
      
      // If it's a File object, upload directly to Storage
      if (imageData instanceof File || (typeof imageData === 'object' && imageData !== null)) {
        console.log("Handling as File object:", (imageData as File).name || "unknown file");
        
        // Create a reference to the payment proof in Firebase Storage with a unique timestamp
        const storageRef = ref(storage, `payment_proofs/${orderID}_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
        
        try {
          // Upload the file
          console.log("Starting file upload to Firebase Storage");
          const uploadResult = await uploadBytes(storageRef, imageData as File);
          console.log("File upload successful, size:", uploadResult.metadata.size);
          
          // Get the download URL
          console.log("Getting download URL for uploaded file");
          screenshotURL = await getDownloadURL(uploadResult.ref);
          console.log("Download URL obtained successfully:", screenshotURL.slice(0, 50) + "...");
        } catch (uploadError) {
          console.error("Error during storage upload:", uploadError);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying upload, attempt ${retryCount + 1}...`);
            continue; // Retry the upload
          }
          throw new Error(`Upload failed after ${MAX_RETRIES + 1} attempts: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } 
      // If it's a data URL, upload as a string
      else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        console.log("Handling as data URL");
        
        // Create a reference to the payment proof in Firebase Storage with a unique timestamp
        const storageRef = ref(storage, `payment_proofs/${orderID}_${Date.now()}_${Math.floor(Math.random() * 1000)}`);
        
        try {
          // It's a base64 data URL, upload directly
          console.log("Starting data URL upload to Firebase Storage");
          await uploadString(storageRef, imageData, 'data_url');
          console.log("Data URL upload successful");
          
          // Get the download URL
          console.log("Getting download URL for uploaded data URL");
          screenshotURL = await getDownloadURL(storageRef);
          console.log("Download URL obtained successfully:", screenshotURL.slice(0, 50) + "...");
        } catch (uploadError) {
          console.error("Error uploading data URL:", uploadError);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying upload, attempt ${retryCount + 1}...`);
            continue; // Retry the upload
          }
          throw new Error(`Upload failed after ${MAX_RETRIES + 1} attempts: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } 
      // If it's a regular URL, store it directly
      else if (typeof imageData === 'string') {
        console.log("Handling as external URL");
        // It's a regular URL, we'll store it directly in Firestore
        screenshotURL = imageData;
        console.log("Using external URL directly:", screenshotURL.slice(0, 50) + "...");
      } 
      else {
        console.error("Invalid image data type:", typeof imageData);
        throw new Error('Invalid image data provided');
      }
      
      // Verify we have a valid URL before proceeding
      if (!screenshotURL) {
        throw new Error('Failed to get a valid image URL');
      }
      
      // Update the order with the screenshot URL
      try {
        console.log("Updating order with screenshot URL");
        const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
        const querySnapshot = await getDocs(orderQuery);
        
        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          console.log("Found order document, updating with screenshot URL");
          
          // Do the Firestore update in a retry loop as well
          let dbRetryCount = 0;
          const MAX_DB_RETRIES = 2;
          
          while (dbRetryCount <= MAX_DB_RETRIES) {
            try {
              await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), {
                screenshotURL,
                updatedAt: Timestamp.now(),
              });
              console.log("Order updated successfully with screenshot URL");
              break; // Success, exit the retry loop
            } catch (dbError) {
              console.error(`Database update attempt ${dbRetryCount + 1} failed:`, dbError);
              if (dbRetryCount < MAX_DB_RETRIES) {
                dbRetryCount++;
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              throw dbError; // All retries failed, rethrow
            }
          }
        } else {
          console.warn(`Order ${orderID} not found when updating screenshot URL`);
          throw new Error(`Order ${orderID} not found. Please try again or contact support.`);
        }
      } catch (firestoreError) {
        console.error("Error updating order with screenshot URL:", firestoreError);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying database update, attempt ${retryCount + 1}...`);
          continue; // Retry the entire operation
        }
        throw new Error(`Error saving image to order: ${firestoreError instanceof Error ? firestoreError.message : 'Database update failed'}`);
      }
      
      console.log("Payment proof upload completed successfully for order:", orderID);
      return screenshotURL; // Success, return the URL
      
    } catch (error) {
      console.error(`Error in uploadPaymentProof attempt ${retryCount + 1}:`, error);
      
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying entire operation, attempt ${retryCount + 1}...`);
        // Wait a bit before retrying the whole operation
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
      
      // All retries failed, throw the error
      throw new Error(error instanceof Error ? error.message : 'Failed to upload payment proof after multiple attempts. Please try again.');
    }
  }
  
  // This should never be reached due to the return or throw in the loop
  throw new Error('Unexpected error in payment proof upload process');
};

/**
 * Helper function to convert File to base64 string
 */
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Get an order by ID
 */
export const getOrderById = async (orderID: string): Promise<Order | null> => {
  const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
  const querySnapshot = await getDocs(orderQuery);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  return querySnapshot.docs[0].data() as Order;
};

/**
 * Get orders by email (most recent first)
 */
export const getOrdersByEmail = async (email: string, limitCount = 5): Promise<Order[]> => {
  const orderQuery = query(
    collection(db, ORDERS_COLLECTION), 
    where('buyerEmail', '==', email),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  
  const querySnapshot = await getDocs(orderQuery);
  return querySnapshot.docs.map(doc => doc.data() as Order);
};

/**
 * Update order status and handle queue position updates
 */
export const updateOrderStatus = async (
  orderID: string, 
  status: OrderStatus, 
  notes?: string
): Promise<boolean> => {
  const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
  const querySnapshot = await getDocs(orderQuery);
  
  if (querySnapshot.empty) {
    return false;
  }
  
  const orderDoc = querySnapshot.docs[0];
  const orderData = orderDoc.data() as Order;
  const previousStatus = orderData.status;
  const updateData: any = {
    status,
    updatedAt: Timestamp.now(),
  };
  
  // Only include notes if it's provided and not undefined
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  
  // If order is completed or cancelled, update queue positions for remaining orders
  if ((status === 'delivered' || status === 'cancelled') && 
      (orderData.status === 'queued' || orderData.status === 'in_progress')) {
    await adjustQueuePositions(orderData.queuePosition || 0);
    
    // Remove queue position from completed order
    updateData.queuePosition = null;
  }
  
  // If changing to in_progress, update estimated delivery time
  if (status === 'in_progress' && orderData.status === 'queued') {
    // Make delivery time estimate more precise for in-progress orders
    if (orderData.deliveryType === 'Express') {
      updateData.estimatedDeliveryTime = Timestamp.fromDate(
        new Date(Date.now() + 15 * 60000) // 15 minutes for Express in progress
      );
    } else {
      updateData.estimatedDeliveryTime = Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60000) // 24 hours for Standard in progress
      );
    }
  }
  
  await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), updateData);
  
  // Send email notifications based on status change
  try {
    // Only send emails if the status actually changed
    if (previousStatus !== status) {
      switch (status) {
        case 'in_progress':
          await sendOrderInProgress(orderData);
          break;
        case 'cancelled':
          await sendOrderCancelled(orderData, notes);
          break;
        case 'delayed':
          await sendOrderDelayed(orderData);
          break;
        // Note: delivered emails are sent separately with delivery content
      }
    }
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
    // Don't fail the status update if email fails
  }
  
  return true;
};

/**
 * Adjust queue positions after an order is completed or cancelled
 */
const adjustQueuePositions = async (removedPosition: number): Promise<void> => {
  try {
    // First query: Get queued orders with higher queue positions
    const queuedOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'queued'),
      where('queuePosition', '>', removedPosition)
    );
    
    // Second query: Get in_progress orders with higher queue positions
    const inProgressOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'in_progress'),
      where('queuePosition', '>', removedPosition)
    );
    
    // Execute both queries
    const [queuedSnapshot, inProgressSnapshot] = await Promise.all([
      getDocs(queuedOrdersQuery),
      getDocs(inProgressOrdersQuery)
    ]);
    
    // Check if there are any orders to adjust
    if (queuedSnapshot.empty && inProgressSnapshot.empty) {
      return; // No orders to adjust
    }
    
    // Use a batch to update all positions atomically
    const batch = writeBatch(db);
    
    // Process queued orders
    queuedSnapshot.docs.forEach(orderDoc => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderDoc.id);
      const currentPosition = orderDoc.data().queuePosition || 0;
      batch.update(orderRef, { 
        queuePosition: currentPosition - 1,
        updatedAt: Timestamp.now()
      });
    });
    
    // Process in_progress orders
    inProgressSnapshot.docs.forEach(orderDoc => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderDoc.id);
      const currentPosition = orderDoc.data().queuePosition || 0;
      batch.update(orderRef, { 
        queuePosition: currentPosition - 1,
        updatedAt: Timestamp.now()
      });
    });
    
    // Commit all updates
    await batch.commit();
  } catch (error) {
    console.error('Error adjusting queue positions:', error);
    // Continue execution rather than throwing, as this is a non-critical operation
  }
};

/**
 * Update delivery type and adjust queue position accordingly
 */
export const updateDeliveryType = async (orderID: string, deliveryType: DeliveryType): Promise<boolean> => {
  const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
  const querySnapshot = await getDocs(orderQuery);
  
  if (querySnapshot.empty) {
    return false;
  }
  
  const orderDoc = querySnapshot.docs[0];
  const orderData = orderDoc.data() as Order;
  
  // If already the same delivery type, no change needed
  if (orderData.deliveryType === deliveryType) {
    return true;
  }
  
  let newPosition: number;
  
  // If changing to Express, move to front of queue
  if (deliveryType === 'Express') {
    // Remove from current position
    await adjustQueuePositions(orderData.queuePosition || 0);
    // Get position at front
    newPosition = 1;
    // Reorder other orders
    await reorderQueueForExpress(0);
  } else {
    // If changing to Standard, move to end of queue
    // Remove from current position
    await adjustQueuePositions(orderData.queuePosition || 0);
    // Get position at end
    newPosition = await getNextQueuePosition();
  }
  
  // Update order with new delivery type and position
  await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), {
    deliveryType,
    queuePosition: newPosition,
    estimatedDeliveryTime: calculateEstimatedDeliveryTime(deliveryType, newPosition),
    updatedAt: Timestamp.now()
  });
  
  return true;
};

/**
 * Add admin notes to an order
 */
export const addAdminNotes = async (orderID: string, adminNotes: string): Promise<boolean> => {
  const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
  const querySnapshot = await getDocs(orderQuery);
  
  if (querySnapshot.empty) {
    return false;
  }
  
  const orderDoc = querySnapshot.docs[0];
  await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), {
    adminNotes,
    updatedAt: Timestamp.now(),
  });
  
  return true;
};

/**
 * Submit order receipt form
 */
export const submitReceiptForm = async (formData: any): Promise<boolean> => {
  try {
    await addDoc(collection(db, RECEIPT_FORMS_COLLECTION), {
      ...formData,
      createdAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Error submitting receipt form:', error);
    return false;
  }
};

/**
 * Get orders for a specific user by email
 */
export const getUserOrders = async (email: string) => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('buyerEmail', '==', email),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(ordersQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Failed to load your orders. Please try again.');
  }
};

/**
 * Subscribe to order updates for real-time tracking
 * Returns an unsubscribe function
 */
export const subscribeToOrder = (
  orderID: string, 
  callback: (order: Order) => void
) => {
  const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
  
  return onSnapshot(orderQuery, (snapshot) => {
    if (!snapshot.empty) {
      const orderData = snapshot.docs[0].data() as Order;
      callback(orderData);
    }
  }, (error) => {
    console.error('Error subscribing to order updates:', error);
  });
};

/**
 * Subscribe to all user orders for real-time tracking
 * Returns an unsubscribe function
 */
export const subscribeToUserOrders = (
  email: string,
  callback: (orders: Order[]) => void
) => {
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('buyerEmail', '==', email),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as unknown as Order));
    
    callback(orders);
  }, (error) => {
    console.error('Error subscribing to user orders:', error);
  });
};

/**
 * Get all active orders (for admin queue management)
 */
export const getActiveOrders = async (filterOptions: { deliveryType?: DeliveryType } = {}) => {
  try {
    // Use a simpler query without ordering by queuePosition to avoid index requirements
    let ordersQuery: any = query(
      collection(db, ORDERS_COLLECTION),
      where('status', 'in', ['queued', 'in_progress'])
    );
    
    // Apply additional filters
    if (filterOptions.deliveryType) {
      ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('status', 'in', ['queued', 'in_progress']),
        where('deliveryType', '==', filterOptions.deliveryType)
      );
    }
    
    const querySnapshot = await getDocs(ordersQuery);
    
    // Sort the results manually by queuePosition
    const orders = querySnapshot.docs.map(doc => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        ...data
      } as unknown as Order;
    });
    
    // Manual sort by queuePosition
    const sortedOrders = orders.sort((a: Order, b: Order) => {
      const posA = a.queuePosition || Number.MAX_SAFE_INTEGER;
      const posB = b.queuePosition || Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });
    
    return sortedOrders;
  } catch (error) {
    console.error('Error fetching active orders:', error);
    throw new Error('Failed to load active orders. Please try again.');
  }
};

/**
 * Subscribe to active orders for real-time admin dashboard
 * Returns an unsubscribe function
 */
export const subscribeToActiveOrders = (
  callback: (orders: Order[]) => void,
  filterOptions: { deliveryType?: DeliveryType } = {}
) => {
  // Use a simpler query without ordering by queuePosition to avoid index requirements
  let ordersQuery: any = query(
    collection(db, ORDERS_COLLECTION),
    where('status', 'in', ['queued', 'in_progress'])
  );
  
  // Apply additional filters if needed
  if (filterOptions.deliveryType) {
    ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', 'in', ['queued', 'in_progress']),
      where('deliveryType', '==', filterOptions.deliveryType)
    );
  }
  
  return onSnapshot(ordersQuery, (snapshot: any) => {
    const orders = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as unknown as Order));
    
    // Manual sort by queuePosition
    const sortedOrders = orders.sort((a: Order, b: Order) => {
      const posA = a.queuePosition || Number.MAX_SAFE_INTEGER;
      const posB = b.queuePosition || Number.MAX_SAFE_INTEGER;
      return posA - posB;
    });
    
    callback(sortedOrders);
  }, (error: Error) => {
    console.error('Error subscribing to active orders:', error);
  });
};

/**
 * Manually update queue position (admin only)
 */
export const updateQueuePosition = async (orderID: string, newPosition: number): Promise<boolean> => {
  try {
    const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
    const querySnapshot = await getDocs(orderQuery);
    
    if (querySnapshot.empty) {
      return false;
    }
    
    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data() as Order;
    const oldPosition = orderData.queuePosition || 0;
    
    // No change needed if position is the same
    if (oldPosition === newPosition) {
      return true;
    }
    
    // Batch update for atomic operations
    const batch = writeBatch(db);
    
    // Update the target order
    const orderRef = doc(db, ORDERS_COLLECTION, orderDoc.id);
    batch.update(orderRef, {
      queuePosition: newPosition,
      updatedAt: Timestamp.now()
    });
    
    // Get all orders that need position adjustment
    const affectedOrdersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', 'in', ['queued', 'in_progress'])
    );
    
    const affectedSnapshot = await getDocs(affectedOrdersQuery);
    
    // Adjust positions for all other affected orders
    affectedSnapshot.docs.forEach(doc => {
      if (doc.id !== orderDoc.id) {
        const affectedOrder = doc.data() as Order;
        const position = affectedOrder.queuePosition || 0;
        let newPos = position;
        
        if (oldPosition < newPosition) {
          // Moving down in queue
          if (position > oldPosition && position <= newPosition) {
            newPos = position - 1;
          }
        } else {
          // Moving up in queue
          if (position >= newPosition && position < oldPosition) {
            newPos = position + 1;
          }
        }
        
        if (newPos !== position) {
          const affectedRef = doc.ref;
          batch.update(affectedRef, {
            queuePosition: newPos,
            updatedAt: Timestamp.now()
          });
        }
      }
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error updating queue position:', error);
    return false;
  }
};

/**
 * Upload delivery proof and mark the order as delivered
 */
export const markOrderAsDeliveredWithProof = async (
  orderID: string, 
  imageData?: string | File | null,
  notes?: string
): Promise<boolean> => {
  try {
    console.log("markOrderAsDeliveredWithProof called:", orderID, imageData ? "with image" : "without image");
    
    // If image data is provided, upload it first
    let deliveryProofURL = '';
    
    if (imageData) {
      console.log("Processing image data, type:", typeof imageData);
      
      // If it's a File object, upload directly to Storage
      if (imageData instanceof File || (typeof imageData === 'object' && imageData !== null)) {
        console.log("Handling as File object:", (imageData as any).name || "unknown file");
        
        // Create a reference to the delivery proof in Firebase Storage
        const storageRef = ref(storage, `delivery_proofs/${orderID}_${Date.now()}`);
        
        try {
          // Upload the file
          const uploadResult = await uploadBytes(storageRef, imageData as File);
          console.log("File upload successful", uploadResult);
          
          // Get the download URL
          try {
            deliveryProofURL = await getDownloadURL(uploadResult.ref);
            console.log("Download URL obtained:", deliveryProofURL);
          } catch (downloadErr) {
            console.error("Error getting download URL:", downloadErr);
            throw new Error(`File uploaded but couldn't retrieve URL: ${downloadErr instanceof Error ? downloadErr.message : 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          throw new Error(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } 
      // If it's a data URL, upload as a string
      else if (typeof imageData === 'string' && imageData.startsWith('data:')) {
        console.log("Handling as data URL");
        
        // Create a reference to the delivery proof in Firebase Storage
        const storageRef = ref(storage, `delivery_proofs/${orderID}_${Date.now()}`);
        
        try {
          // It's a base64 data URL, upload directly
          await uploadString(storageRef, imageData, 'data_url');
          console.log("Data URL upload successful");
          
          // Get the download URL
          try {
            deliveryProofURL = await getDownloadURL(storageRef);
            console.log("Download URL obtained:", deliveryProofURL);
          } catch (downloadErr) {
            console.error("Error getting download URL:", downloadErr);
            throw new Error(`File uploaded but couldn't retrieve URL: ${downloadErr instanceof Error ? downloadErr.message : 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error("Error uploading data URL:", uploadError);
          throw new Error(`Upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      } 
      // If it's a regular URL, store it directly
      else if (typeof imageData === 'string') {
        console.log("Handling as external URL");
        // It's a regular URL, we'll store it directly
        deliveryProofURL = imageData;
      }
    }
    
    // Get the order
    console.log("Getting order:", orderID);
    const orderQuery = query(collection(db, ORDERS_COLLECTION), where('orderID', '==', orderID));
    const querySnapshot = await getDocs(orderQuery);
    
    if (querySnapshot.empty) {
      console.error("Order not found:", orderID);
      return false;
    }
    
    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data() as Order;
    console.log("Order found:", orderData.orderID);
    
    // Prepare update data
    const updateData: any = {
      status: 'delivered',
      updatedAt: Timestamp.now(),
      deliveredAt: Timestamp.now(), // Add timestamp for delivery time
    };
    
    // Add delivery proof URL if available
    if (deliveryProofURL) {
      updateData.deliveryProofURL = deliveryProofURL;
    }
    
    // Add notes if provided
    if (notes !== undefined) {
      updateData.adminNotes = notes;
    }
    
    // If order was in queue, adjust queue positions for remaining orders
    if (orderData.status === 'queued' || orderData.status === 'in_progress') {
      await adjustQueuePositions(orderData.queuePosition || 0);
      
      // Remove queue position from completed order
      updateData.queuePosition = null;
    }
    
    // Update the order
    console.log("Updating order with delivery data:", updateData);
    await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), updateData);
    console.log("Order marked as delivered successfully");
    
    return true;
  } catch (error) {
    console.error('Error marking order as delivered with proof:', error);
    throw new Error('Failed to update order. Please try again.');
  }
};

/**
 * Get all orders
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      orderID: doc.id
    } as Order));
  } catch (error) {
    console.error('Error getting all orders:', error);
    return [];
  }
}; 