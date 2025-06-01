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
  console.log(`[MOCK] Email would be sent to: ${to}`);
  console.log(`[MOCK] Subject: ${subject}`);
  return { success: true, messageId: 'mock-email-id' };
}

/**
 * Generate order update email content
 * @param {Object} order - Order object
 * @param {string} status - Order status
 * @param {string} message - Custom message to include
 * @returns {Object} - Email template with subject, html and text
 */
function generateOrderUpdateEmail(order, status, message) {
  console.log(`[MOCK] Generating email template for order: ${order?.orderID}, status: ${status}`);
  
  return {
    subject: `Order Update: ${status}`,
    html: `<div>This would be an HTML email about order ${order?.orderID} with status ${status}</div>`,
    text: `This would be a text email about order ${order?.orderID} with status ${status}`
  };
}

module.exports = {
  sendEmail,
  generateOrderUpdateEmail
}; 