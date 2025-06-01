// This is a simple wrapper for the actual email service in the nested directory
const fs = require('fs');
const path = require('path');

const actualEmailServicePath = path.join(__dirname, 'the-turkish-shop/src/api/emailService.js');

// Export the actual email service if it exists, otherwise provide dummy functions
if (fs.existsSync(actualEmailServicePath)) {
  module.exports = require(actualEmailServicePath);
} else {
  // Provide dummy functions to prevent errors
  module.exports = {
    sendEmail: async ({ to, subject, html, text }) => {
      console.log(`[DUMMY] Would send email to ${to} with subject: ${subject}`);
      return { success: true, messageId: 'dummy-id' };
    },
    
    generateOrderUpdateEmail: (order, status, message) => {
      console.log(`[DUMMY] Would generate email for order ${order?.orderID} with status ${status}`);
      return { 
        subject: `Order Update - Status: ${status}`,
        html: '<p>This is a dummy email template.</p>',
        text: 'This is a dummy email template.'
      };
    }
  };
} 