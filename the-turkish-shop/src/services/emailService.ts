// Mock Email Service
// This file replaces the actual email service with mock implementations
// All functions return success results without sending actual emails

import { Order } from '../types/Order';
import { HelpRequest } from '../types/HelpRequest';

// Basic email sending function
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  console.log(`[MOCK] Would send email to: ${options.to}`);
  console.log(`[MOCK] Subject: ${options.subject}`);
  return { success: true, messageId: `mock-${Date.now()}` };
};

// Order-related email functions
export const sendOrderConfirmation = async (order: Order): Promise<boolean> => {
  console.log(`[MOCK] Would send order confirmation for order ${order.orderID}`);
  return true;
};

export const sendOrderInProgress = async (order: Order): Promise<boolean> => {
  console.log(`[MOCK] Would send order in progress notification for order ${order.orderID}`);
  return true;
};

export const sendOrderCancelled = async (order: Order): Promise<boolean> => {
  console.log(`[MOCK] Would send order cancelled notification for order ${order.orderID}`);
  return true;
};

export const sendOrderDelayed = async (order: Order): Promise<boolean> => {
  console.log(`[MOCK] Would send order delayed notification for order ${order.orderID}`);
  return true;
};

export const sendOrderDelivered = async (order: Order): Promise<boolean> => {
  console.log(`[MOCK] Would send order delivered notification for order ${order.orderID}`);
  return true;
};

// Support-related email functions
export const sendSupportRequestConfirmation = async (helpRequest: HelpRequest): Promise<boolean> => {
  console.log(`[MOCK] Would send support request confirmation for request ${helpRequest.id}`);
  return true;
};

export const sendAdminSupportNotification = async (helpRequest: HelpRequest): Promise<boolean> => {
  console.log(`[MOCK] Would send admin support notification for request ${helpRequest.id}`);
  return true;
};

export const sendSupportReplyEmail = async (
  helpRequest: HelpRequest,
  message: string
): Promise<boolean> => {
  console.log(`[MOCK] Would send support reply for request ${helpRequest.id}`);
  return true;
};

export default {
  sendEmail,
  sendOrderConfirmation,
  sendOrderInProgress,
  sendOrderCancelled,
  sendOrderDelayed,
  sendOrderDelivered,
  sendSupportRequestConfirmation,
  sendAdminSupportNotification,
  sendSupportReplyEmail
}; 