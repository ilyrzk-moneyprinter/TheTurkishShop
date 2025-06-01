// This is a simple wrapper for the actual email service in the nested directory
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Path to the actual email service
const actualEmailServicePath = path.join(__dirname, 'the-turkish-shop/src/api/emailService.js');

// Try to create a direct email transporter as fallback
let directTransporter;
try {
  directTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.resend.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'resend',
      pass: process.env.EMAIL_PASSWORD || 're_UBRuxCtM_EXUYqZfcXc4va6o4sbfgQaw4'
    }
  });
} catch (error) {
  console.error('Failed to create direct email transporter:', error);
}

// Create backup/fallback email functions
const fallbackEmailService = {
  sendEmail: async ({ to, subject, html, text }) => {
    console.log(`[FALLBACK] Attempting to send email to ${to} with subject: ${subject}`);
    try {
      if (directTransporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'orders@theturkishshop.com',
          to,
          subject,
          html,
          text
        };
        
        const info = await directTransporter.sendMail(mailOptions);
        console.log(`[FALLBACK] Email sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
      } else {
        console.log(`[FALLBACK] Would send email to ${to} with subject: ${subject}`);
        return { success: true, messageId: 'fallback-dummy-id' };
      }
    } catch (error) {
      console.error('[FALLBACK] Failed to send email:', error);
      return { success: false, error: error.message };
    }
  },
  
  generateOrderUpdateEmail: (order, status, message) => {
    console.log(`[FALLBACK] Generating email for order ${order?.orderID || 'unknown'} with status ${status}`);
    
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

// Export the actual email service if it exists, otherwise provide fallback functions
let exportedModule;
try {
  if (fs.existsSync(actualEmailServicePath)) {
    console.log('Loading email service from:', actualEmailServicePath);
    exportedModule = require(actualEmailServicePath);
    console.log('Successfully loaded email service module');
  } else {
    console.log('Email service module not found at path:', actualEmailServicePath);
    exportedModule = fallbackEmailService;
  }
} catch (error) {
  console.error('Error loading email service module:', error);
  exportedModule = fallbackEmailService;
}

module.exports = exportedModule; 