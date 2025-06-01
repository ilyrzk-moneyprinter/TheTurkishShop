import { collection, getDocs, query, orderBy, limit, where, Timestamp, getCountFromServer, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { Order, OrderStatus } from './types';
import { isAdmin as checkAdmin } from './authService';
import { updateOrderStatus, addAdminNotes } from './orderService';
import { sendOrderDelivered } from '../services/emailService';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';
const USERS_COLLECTION = 'users';
const VOUCHES_COLLECTION = 'vouches';
const HELP_REQUESTS_COLLECTION = 'helpRequests';

/**
 * Helper function to check if a collection exists
 */
const collectionExists = async (collectionName: string): Promise<boolean> => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getCountFromServer(collectionRef);
    // Collection exists if we can query it without error
    return true;
  } catch (error) {
    console.warn(`Collection ${collectionName} does not exist or cannot be accessed:`, error);
    return false;
  }
};

/**
 * Get all orders with pagination (admin only)
 */
export const getAllOrders = async (
  pageSize = 20, 
  startAfter?: Timestamp,
  filterStatus?: OrderStatus
): Promise<{ orders: Order[], lastVisible: Timestamp | null }> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Build query
  let ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  
  // Add status filter if provided
  if (filterStatus) {
    ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', filterStatus),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  
  // Add pagination if startAfter is provided
  if (startAfter) {
    ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      filterStatus ? where('status', '==', filterStatus) : where('status', '!=', ''),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  
  const querySnapshot = await getDocs(ordersQuery);
  const orders = querySnapshot.docs.map(doc => doc.data() as Order);
  
  // Get the last visible document for pagination
  const lastVisible = querySnapshot.docs.length > 0 
    ? querySnapshot.docs[querySnapshot.docs.length - 1].data().createdAt
    : null;
  
  return { orders, lastVisible };
};

/**
 * Get orders statistics (counts by status)
 */
export const getOrderStats = async (): Promise<Record<OrderStatus, number>> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const stats: Record<OrderStatus, number> = {
    pending: 0,
    'Payment Verification': 0,
    queued: 0,
    in_progress: 0,
    delivered: 0,
    delayed: 0,
    cancelled: 0
  };
  
  // Get counts for each status
  for (const status of Object.keys(stats) as OrderStatus[]) {
    const statusQuery = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', status)
    );
    const querySnapshot = await getDocs(statusQuery);
    stats[status] = querySnapshot.size;
  }
  
  return stats;
};

/**
 * Search orders by email or order ID
 */
export const searchOrders = async (searchTerm: string): Promise<Order[]> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Check if search term is an email
  const isEmail = searchTerm.includes('@');
  
  // Create query based on search type
  const searchQuery = isEmail 
    ? query(
        collection(db, ORDERS_COLLECTION),
        where('buyerEmail', '==', searchTerm),
        orderBy('createdAt', 'desc')
      )
    : query(
        collection(db, ORDERS_COLLECTION),
        where('orderID', '==', searchTerm)
      );
  
  const querySnapshot = await getDocs(searchQuery);
  return querySnapshot.docs.map(doc => doc.data() as Order);
};

/**
 * Process an order (change status and add notes)
 */
export const processOrder = async (
  orderID: string, 
  status: OrderStatus, 
  adminNotes?: string
): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Update order status (this will now send emails automatically)
  const statusUpdated = await updateOrderStatus(orderID, status, adminNotes);
  
  // Add admin notes if provided
  if (statusUpdated && adminNotes) {
    await addAdminNotes(orderID, adminNotes);
  }
  
  return statusUpdated;
};

/**
 * Get recent orders (most recent first)
 */
export const getRecentOrders = async (limitCount = 5): Promise<Order[]> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const ordersQuery = query(
    collection(db, ORDERS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(ordersQuery);
  return querySnapshot.docs.map(doc => doc.data() as Order);
};

/**
 * Calculate revenue summary
 */
export const getRevenueSummary = async (): Promise<{
  today: number;
  week: number;
  month: number;
  total: number;
  currency: string;
}> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Get all orders
  const ordersQuery = query(collection(db, ORDERS_COLLECTION));
  const querySnapshot = await getDocs(ordersQuery);
  const orders = querySnapshot.docs.map(doc => doc.data() as Order);
  
  // Default currency
  let currency = '£';
  if (orders.length > 0 && orders[0].currency) {
    currency = orders[0].currency;
  }
  
  // Calculate time thresholds
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Initialize revenue totals
  let todayRevenue = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  let totalRevenue = 0;
  
  // Calculate revenue
  orders.forEach(order => {
    let orderDate: Date;
    // Handle Firestore Timestamp objects
    if (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt && typeof order.createdAt.toDate === 'function') {
      orderDate = order.createdAt.toDate();
    } else if (order.createdAt instanceof Date) {
      orderDate = order.createdAt;
    } else if (typeof order.createdAt === 'string' || typeof order.createdAt === 'number') {
      orderDate = new Date(order.createdAt);
    } else {
      return; // Skip if no valid date
    }
    
    // Skip cancelled orders
    if (order.status === 'cancelled') {
      return;
    }
    
    // Calculate price as number
    const price = parseFloat(order.price) || 0;
    
    // Add to total revenue
    totalRevenue += price;
    
    // Check time periods
    if (orderDate >= todayStart) {
      todayRevenue += price;
    }
    
    if (orderDate >= weekStart) {
      weekRevenue += price;
    }
    
    if (orderDate >= monthStart) {
      monthRevenue += price;
    }
  });
  
  return {
    today: todayRevenue,
    week: weekRevenue,
    month: monthRevenue,
    total: totalRevenue,
    currency
  };
};

/**
 * Get combined statistics for admin dashboard
 */
export const getAdminStats = async () => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  try {
    // Get orders stats
    const ordersStats = await getOrdersStats();
    
    // Get users count - with error handling
    let usersCount = 0;
    try {
      usersCount = await getUsersCount();
    } catch (err) {
      console.warn('Error fetching users count:', err);
      // Continue with default value
    }
    
    // Get products count - with error handling
    let productsCount = 0;
    try {
      productsCount = await getProductsCount();
    } catch (err) {
      console.warn('Error fetching products count:', err);
      // Continue with default value
    }
    
    // Get pending vouches count - with error handling
    let pendingVouches = 0;
    try {
      pendingVouches = await getPendingVouchesCount();
    } catch (err) {
      console.warn('Error fetching pending vouches count:', err);
      // Continue with default value
    }
    
    // Get open help requests count - with error handling
    let openHelpRequests = 0;
    try {
      openHelpRequests = await getOpenHelpRequestsCount();
    } catch (err) {
      console.warn('Error fetching open help requests count:', err);
      // Continue with default value
    }
    
    return {
      ...ordersStats,
      totalUsers: usersCount,
      totalProducts: productsCount,
      pendingVouches,
      openHelpRequests
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw new Error('Failed to load admin statistics');
  }
};

/**
 * Get orders statistics
 */
const getOrdersStats = async () => {
  try {
    // Check if collection exists first
    const exists = await collectionExists(ORDERS_COLLECTION);
    if (!exists) {
      console.warn(`${ORDERS_COLLECTION} collection doesn't exist`);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        recentRevenue: 0
      };
    }
    
    const ordersCollection = collection(db, ORDERS_COLLECTION);
    
    // Get all orders
    const ordersQuery = query(ordersCollection);
    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    
    // Calculate statistics
    let totalOrders = orders.length;
    let pendingOrders = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    let recentRevenue = 0;
    
    // Get timestamp for 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    orders.forEach(order => {
      // Count by status
      switch (order.status) {
        case 'queued':
          pendingOrders++;
          break;
        case 'in_progress':
          processingOrders++;
          break;
        case 'delivered':
          completedOrders++;
          // Check if price exists and is a valid number
          const orderPriceStr = order.totalPrice || order.price || '0';
          const orderPrice = parseFloat(orderPriceStr);
          if (!isNaN(orderPrice)) {
            totalRevenue += orderPrice;
            
            // Check if recent (within last 7 days)
            try {
              let orderDate: Date | null = null;
              
              // Handle Firestore Timestamp objects
              if (order.updatedAt && typeof order.updatedAt === 'object' && 'toDate' in order.updatedAt) {
                orderDate = order.updatedAt.toDate();
              } else if (order.createdAt && typeof order.createdAt === 'object' && 'toDate' in order.createdAt) {
                orderDate = order.createdAt.toDate();
              }
              
              if (orderDate && orderDate >= sevenDaysAgo) {
                recentRevenue += orderPrice;
              }
            } catch (err) {
              console.warn('Error processing order date:', err);
            }
          }
          break;
        case 'delayed':
          // Count delayed orders as processing for stats purposes
          processingOrders++;
          break;
        case 'cancelled':
          cancelledOrders++;
          break;
        // Handle unknown status as a fallback
        default:
          console.warn(`Unknown order status: ${order.status}`);
          break;
      }
    });
    
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      recentRevenue
    };
  } catch (err) {
    console.error('Error in getOrdersStats:', err);
    // Return zero values to prevent dashboard crash
    return {
      totalOrders: 0,
      pendingOrders: 0,
      processingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      totalRevenue: 0,
      recentRevenue: 0
    };
  }
};

/**
 * Get total users count
 */
const getUsersCount = async () => {
  try {
    // Check if collection exists first
    const exists = await collectionExists(USERS_COLLECTION);
    if (!exists) {
      console.warn(`${USERS_COLLECTION} collection doesn't exist`);
      return 0;
    }
    
    const usersCollection = collection(db, USERS_COLLECTION);
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.size;
  } catch (err) {
    console.error('Error in getUsersCount:', err);
    return 0;
  }
};

/**
 * Get total products count
 */
const getProductsCount = async () => {
  try {
    // Check if collection exists first
    const exists = await collectionExists(PRODUCTS_COLLECTION);
    if (!exists) {
      console.warn(`${PRODUCTS_COLLECTION} collection doesn't exist`);
      return 0;
    }
    
    const productsCollection = collection(db, PRODUCTS_COLLECTION);
    const productsSnapshot = await getDocs(productsCollection);
    return productsSnapshot.size;
  } catch (err) {
    console.error('Error in getProductsCount:', err);
    return 0;
  }
};

/**
 * Get count of pending vouches/testimonials
 */
const getPendingVouchesCount = async () => {
  try {
    // Check if collection exists first
    const exists = await collectionExists(VOUCHES_COLLECTION);
    if (!exists) {
      console.warn(`${VOUCHES_COLLECTION} collection doesn't exist`);
      return 0;
    }
    
    const vouchesCollection = collection(db, VOUCHES_COLLECTION);
    const pendingQuery = query(vouchesCollection, where('status', '==', 'pending'));
    const pendingSnapshot = await getDocs(pendingQuery);
    return pendingSnapshot.size;
  } catch (err) {
    console.error('Error in getPendingVouchesCount:', err);
    return 0;
  }
};

/**
 * Get count of open help requests
 */
const getOpenHelpRequestsCount = async () => {
  try {
    // Check if collection exists first
    const exists = await collectionExists(HELP_REQUESTS_COLLECTION);
    if (!exists) {
      console.warn(`${HELP_REQUESTS_COLLECTION} collection doesn't exist`);
      return 0;
    }
    
    const helpCollection = collection(db, HELP_REQUESTS_COLLECTION);
    const openQuery = query(helpCollection, where('status', '==', 'open'));
    const openSnapshot = await getDocs(openQuery);
    return openSnapshot.size;
  } catch (err) {
    console.error('Error in getOpenHelpRequestsCount:', err);
    return 0;
  }
};

/**
 * Update order delivery value and mark as delivered
 */
export const updateOrderDeliveryValue = async (orderId: string, deliveryValue: string): Promise<void> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('orderID', '==', orderId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data() as Order;
    const orderRef = doc(db, 'orders', orderDoc.id);
    
    await updateDoc(orderRef, {
      deliveryValue,
      status: 'delivered',
      deliveredAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Send delivery email to customer
    try {
      await sendOrderDelivered(orderData, deliveryValue);
    } catch (emailError) {
      console.error('Failed to send delivery email:', emailError);
      // Don't fail the delivery update if email fails
    }
  } else {
    throw new Error('Order not found');
  }
};

/**
 * Mark order as express delivery
 */
export const markOrderAsExpress = async (
  orderID: string,
  isExpress: boolean
): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Find the order
  const orderQuery = query(
    collection(db, ORDERS_COLLECTION),
    where('orderID', '==', orderID)
  );
  
  const querySnapshot = await getDocs(orderQuery);
  
  if (querySnapshot.empty) {
    throw new Error('Order not found');
  }
  
  const orderDoc = querySnapshot.docs[0];
  
  // Update the order
  await updateDoc(doc(db, ORDERS_COLLECTION, orderDoc.id), {
    isExpress,
    updatedAt: Timestamp.now(),
  });
  
  return true;
}; 