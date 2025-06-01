const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Configure email service
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_UBRuxCtM_EXUYqZfcXc4va6o4sbfgQaw4';
const FROM_EMAIL = 'orders@theturkishshop.com';
const FROM_NAME = 'The Turkish Shop';

// Email templates
const htmlTemplates = {
  orderConfirmation: fs.existsSync(path.join(__dirname, 'templates/orderConfirmation.html')) 
    ? fs.readFileSync(path.join(__dirname, 'templates/orderConfirmation.html'), 'utf8')
    : null,
  orderDelivered: fs.existsSync(path.join(__dirname, 'templates/orderDelivered.html'))
    ? fs.readFileSync(path.join(__dirname, 'templates/orderDelivered.html'), 'utf8')
    : null
};

/**
 * Send email using Resend API
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise<Object>} - Response with success status and message ID or error
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to || !subject || (!html && !text)) {
    return { success: false, error: 'Missing required email fields' };
  }

  try {
    console.log(`Sending email to ${to} with subject: ${subject}`);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to,
        subject,
        html,
        text,
        tags: [{ name: 'category', value: 'order-notification' }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return { 
        success: false, 
        error: `Email delivery failed: ${response.status} ${response.statusText}`,
        details: errorData
      };
    }

    const result = await response.json();
    console.log(`Email sent successfully to ${to}, ID: ${result.id}`);
    return { success: true, messageId: result.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

/**
 * Generates an order update email
 * @param {Object} order - Order data
 * @param {string} status - New order status
 * @param {string} message - Additional message
 * @returns {Object} - Email template with subject, HTML and text content
 */
const generateOrderUpdateEmail = (order, status, message) => {
  const statusColors = {
    processing: '#ffc107',
    shipped: '#17a2b8',
    delivered: '#28a745',
    cancelled: '#dc3545',
    delayed: '#6c757d'
  };

  const color = statusColors[status.toLowerCase()] || '#007bff';
  
  const subject = `Order ${order.orderID} ${status.charAt(0).toUpperCase() + status.slice(1)}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">The Turkish Shop</h1>
        <p style="margin: 10px 0 0 0;">Order Update</p>
      </div>
      
      <div style="padding: 30px; background-color: #f5f5f5;">
        <div style="background-color: ${color}; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: white; margin: 0; text-align: center;">Your Order is ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
        </div>
        
        <p style="color: #666;">Order ID: <strong>${order.orderID}</strong></p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Update Details</h3>
          <p style="color: #555;">${message}</p>
        </div>
        
        <p style="color: #666; margin-top: 30px;">
          If you have any questions, please don't hesitate to contact our support team.
        </p>
        
        <p style="color: #666;">
          Best regards,<br>
          The Turkish Shop Team
        </p>
      </div>
      
      <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© ${new Date().getFullYear()} The Turkish Shop. All rights reserved.</p>
      </div>
    </div>
  `;

  const text = `
The Turkish Shop - Order Update

Your Order is ${status.charAt(0).toUpperCase() + status.slice(1)}

Order ID: ${order.orderID}

Update Details:
${message}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The Turkish Shop Team
  `;

  return { subject, html, text };
};

module.exports = { 
  sendEmail,
  generateOrderUpdateEmail
}; 