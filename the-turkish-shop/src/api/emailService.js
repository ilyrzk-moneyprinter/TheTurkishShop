// const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables safely
try {
  const envPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('Email service: Environment loaded from:', envPath);
  } else {
    dotenv.config();
    console.log('Email service: Using default environment');
  }
} catch (error) {
  console.error('Email service: Error loading environment variables:', error);
  dotenv.config(); // Try default location as fallback
}

// Create a mock email service that doesn't establish any connections
const mockEmailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    console.log(`[NESTED API MOCK] Would send email to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'mock-nested-email-id' };
  }
};

console.log('Email service: Using mock implementation for Cloud Run');

// Export the mock service
module.exports = mockEmailService;

/**
 * Send an email using the mock implementation
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML content (optional)
 * @param {string} [options.text] - Plain text content (optional)
 * @returns {Promise<Object>} - Result object with success status
 */
async function sendEmail({ to, subject, html, text }) {
  console.log(`Email service: Mock sending email to ${to} with subject: ${subject}`);
  return { success: true, messageId: 'mock-message-id' };
}

/**
 * Generate order update email content
 * @param {Object} order - Order object
 * @param {string} status - Order status
 * @param {string} message - Custom message to include
 * @returns {Object} - Email template with subject, html and text
 */
function generateOrderUpdateEmail(order, status, message) {
  const statusColor = {
    'Pending': '#fbbf24',
    'Processing': '#3b82f6',
    'Shipped': '#10b981',
    'Delivered': '#16a34a',
    'Canceled': '#ef4444',
    'Refunded': '#8b5cf6',
    'On Hold': '#f59e0b'
  }[status] || '#3b82f6';

  const subject = `Order #${order.orderID} ${status}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">The Turkish Shop</h1>
          <p style="margin: 5px 0 0;">Order Status Update</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-bottom: 1px solid #e5e7eb;">
          <h2 style="margin-top: 0; color: #111827;">Hi there,</h2>
          <p>Your order status has been updated.</p>
          
          <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111827;">Order #${order.orderID}</h3>
            <p style="margin-bottom: 5px;"><strong>Status:</strong> <span style="display: inline-block; background-color: ${statusColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 14px;">${status}</span></p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            ${message ? `<p style="border-left: 4px solid ${statusColor}; padding-left: 10px;">${message}</p>` : ''}
          </div>
          
          <p>If you have any questions about your order, please contact our support team.</p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
          <p>&copy; ${new Date().getFullYear()} The Turkish Shop. All rights reserved.</p>
          <p style="margin: 5px 0 0;">This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Create plain text version
  const text = `
    THE TURKISH SHOP
    ================
    
    Order #${order.orderID} Status: ${status}
    Date: ${new Date().toLocaleDateString()}
    
    ${message || 'Your order status has been updated.'}
    
    If you have any questions about your order, please contact our support team.
    
    © ${new Date().getFullYear()} The Turkish Shop. All rights reserved.
  `;
  
  return { subject, html, text };
}

module.exports = {
  sendEmail,
  generateOrderUpdateEmail
}; 