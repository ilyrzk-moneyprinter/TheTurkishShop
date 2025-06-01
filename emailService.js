// This is a simple wrapper for the actual email service in the nested directory
const fs = require('fs');
const path = require('path');
// Removing nodemailer usage that could conflict with port binding
// const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Path to the actual email service
const actualEmailServicePath = path.join(__dirname, 'the-turkish-shop/src/api/emailService.js');

// Create a mock email service instead of using actual transporter
const mockEmailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    console.log(`[MOCK] Would send email to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'mock-email-id' };
  },
  
  generateOrderUpdateEmail: (order, status, message) => {
    console.log(`[MOCK] Generating email for order ${order?.orderID || 'unknown'} with status ${status}`);
    
    const subject = `Order ${order?.orderID || 'Update'} - Status: ${status}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: white;">
            <h1 style="margin: 0;">The Turkish Shop</h1>
            <p>Order Status Update</p>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; margin-top: 20px;">
            <h2>Order Status: ${status}</h2>
            <p>${message || 'Your order status has been updated.'}</p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} The Turkish Shop</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
      THE TURKISH SHOP
      ================
      
      Order Status: ${status}
      
      ${message || 'Your order status has been updated.'}
      
      © ${new Date().getFullYear()} The Turkish Shop
    `;
    
    return { subject, html, text };
  }
};

// Export the mock email service instead of trying to load the actual one
console.log('Using mock email service to avoid connection issues');
module.exports = mockEmailService; 