import { collection, getDocs, query, doc, updateDoc, getDoc, addDoc, deleteDoc, where, serverTimestamp, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { isAdmin as checkAdmin } from './authService';
import { v4 as uuidv4 } from 'uuid';
import { sendSupportReplyEmail, sendSupportRequestConfirmation, sendAdminSupportNotification } from '../services/emailService';
import { ADMIN_CONFIG } from '../config/constants';

const HELP_REQUESTS_COLLECTION = 'helpRequests';

// Help status types
export type HelpStatus = 'open' | 'inProgress' | 'resolved';

/**
 * Interface for help reply
 */
export interface HelpReply {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: any;
}

/**
 * Interface for help request
 */
export interface HelpRequest {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: HelpStatus;
  replies?: HelpReply[];
  createdAt: any;
  updatedAt?: any;
}

/**
 * Get all help requests (admin only)
 */
export const getAllHelpRequests = async (): Promise<HelpRequest[]> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const helpRequestsQuery = query(
    collection(db, HELP_REQUESTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(helpRequestsQuery);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id,
      ...data,
    } as HelpRequest;
  });
};

/**
 * Update help request status (admin only)
 */
export const updateHelpRequestStatus = async (id: string, status: HelpStatus): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Validate status
  if (!['open', 'inProgress', 'resolved'].includes(status)) {
    throw new Error('Invalid status value');
  }
  
  const helpRef = doc(db, HELP_REQUESTS_COLLECTION, id);
  await updateDoc(helpRef, {
    status,
    updatedAt: serverTimestamp()
  });
  
  return true;
};

/**
 * Add admin reply to help request (admin only)
 */
export const addAdminReply = async (helpRequestId: string, message: string): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  // Validate message
  if (!message.trim()) {
    throw new Error('Reply message cannot be empty');
  }
  
  // Get current help request
  const helpRef = doc(db, HELP_REQUESTS_COLLECTION, helpRequestId);
  const helpDoc = await getDoc(helpRef);
  
  if (!helpDoc.exists()) {
    throw new Error('Help request not found');
  }
  
  const helpData = helpDoc.data();
  const currentReplies = helpData.replies || [];
  
  // Create new reply
  const newReply: HelpReply = {
    id: uuidv4(),
    message,
    isAdmin: true,
    createdAt: serverTimestamp()
  };
  
  // Add reply to help request
  await updateDoc(helpRef, {
    replies: [...currentReplies, newReply],
    updatedAt: serverTimestamp()
  });
  
  // Send email notification to customer
  try {
    await sendSupportReplyEmail(
      helpData.email,
      helpData.subject,
      helpData.name,
      message,
      helpRequestId,
      helpData.status
    );
    console.log('Support reply email sent successfully');
  } catch (emailError) {
    console.error('Failed to send support reply email:', emailError);
    // Don't throw error - we still want the reply to be saved even if email fails
  }
  
  return true;
};

/**
 * Delete help request (admin only)
 */
export const deleteHelpRequest = async (id: string): Promise<boolean> => {
  // Check admin rights
  const adminCheck = await checkAdmin();
  if (!adminCheck) {
    throw new Error('Unauthorized: Admin access required');
  }
  
  const helpRef = doc(db, HELP_REQUESTS_COLLECTION, id);
  await deleteDoc(helpRef);
  return true;
};

/**
 * Submit new help request (public)
 */
export const submitHelpRequest = async (name: string, email: string, subject: string, message: string): Promise<string> => {
  // Validate input
  if (!name || !email || !subject || !message) {
    throw new Error('All fields are required');
  }
  
  // Create help request
  const newRequest = {
    name,
    email,
    subject,
    message,
    status: 'open' as HelpStatus,
    replies: [],
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, HELP_REQUESTS_COLLECTION), newRequest);
  const ticketId = docRef.id;
  
  // Send email notifications
  try {
    // Send confirmation to customer
    await sendSupportRequestConfirmation(
      email,
      name,
      subject,
      ticketId,
      message
    );
    console.log('Support request confirmation email sent to customer');
    
    // Send notification to admin
    await sendAdminSupportNotification(
      ADMIN_CONFIG.notificationEmail,
      name,
      email,
      subject,
      ticketId,
      message
    );
    console.log('New support request notification sent to admin');
  } catch (emailError) {
    console.error('Failed to send support request emails:', emailError);
    // Don't throw error - we still want the request to be created even if email fails
  }
  
  return ticketId;
};

/**
 * Add customer reply to existing help request
 */
export const addCustomerReply = async (helpRequestId: string, message: string, email: string): Promise<boolean> => {
  // Validate
  if (!message.trim()) {
    throw new Error('Reply message cannot be empty');
  }
  
  // Get current help request
  const helpRef = doc(db, HELP_REQUESTS_COLLECTION, helpRequestId);
  const helpDoc = await getDoc(helpRef);
  
  if (!helpDoc.exists()) {
    throw new Error('Help request not found');
  }
  
  // Verify this user owns the help request
  const helpData = helpDoc.data();
  if (helpData.email !== email) {
    throw new Error('Unauthorized: You can only reply to your own help requests');
  }
  
  const currentReplies = helpData.replies || [];
  
  // Create new reply
  const newReply: HelpReply = {
    id: uuidv4(),
    message,
    isAdmin: false,
    createdAt: serverTimestamp()
  };
  
  // Add reply and update status if resolved
  await updateDoc(helpRef, {
    replies: [...currentReplies, newReply],
    status: helpData.status === 'resolved' ? 'open' : helpData.status,
    updatedAt: serverTimestamp()
  });
  
  return true;
}; 