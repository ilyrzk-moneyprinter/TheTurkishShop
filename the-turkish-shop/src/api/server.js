const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Import routes - with error handling
let gamePriceRoutes;
try {
  const routesPath = path.join(__dirname, 'routes', 'gamePrice.js');
  if (fs.existsSync(routesPath)) {
    gamePriceRoutes = require('./routes/gamePrice');
    console.log('Game price routes loaded successfully');
  } else {
    console.log('Game price routes file not found at:', routesPath);
    // Create a dummy router if the file doesn't exist
    const dummyRouter = express.Router();
    dummyRouter.post('/fetch-game', (req, res) => {
      res.status(501).json({ error: 'Game price service not implemented' });
    });
    gamePriceRoutes = dummyRouter;
  }
} catch (error) {
  console.error('Error loading game price routes:', error);
  // Create a dummy router on error
  const errorRouter = express.Router();
  errorRouter.post('/fetch-game', (req, res) => {
    res.status(500).json({ error: 'Failed to load game price service' });
  });
  gamePriceRoutes = errorRouter;
}

// Try to import email service - with fallback
let sendEmail, generateOrderUpdateEmail;
try {
  const emailServicePath = path.join(__dirname, 'emailService.js');
  if (fs.existsSync(emailServicePath)) {
    const emailService = require('./emailService');
    sendEmail = emailService.sendEmail;
    generateOrderUpdateEmail = emailService.generateOrderUpdateEmail;
    console.log('Email service loaded successfully');
  } else {
    console.log('Email service file not found at:', emailServicePath);
    // Create dummy functions
    sendEmail = async ({ to, subject }) => {
      console.log(`[DUMMY] Would send email to ${to} with subject: ${subject}`);
      return { success: true, messageId: 'dummy-id' };
    };
    generateOrderUpdateEmail = () => ({ subject: 'Order Update', html: '', text: '' });
  }
} catch (error) {
  console.error('Error loading email service:', error);
  // Create dummy functions on error
  sendEmail = async () => ({ success: false, error: 'Email service unavailable' });
  generateOrderUpdateEmail = () => ({ subject: 'Error', html: '', text: '' });
}

// Load environment variables
try {
  const envPath = path.resolve(__dirname, '../../../.env');
  console.log('API: Looking for .env file at:', envPath);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('API: Environment loaded from:', envPath);
  } else {
    dotenv.config();
    console.log('API: Using default environment');
  }
} catch (error) {
  console.error('API: Error loading environment variables:', error);
}

// Create Express router
const router = express.Router();

// Logging middleware
router.use(morgan('dev'));

// Debug middleware in development mode
if (process.env.NODE_ENV === 'development') {
  router.use((req, res, next) => {
    console.log('API Request URL:', req.originalUrl);
    console.log('API Request Method:', req.method);
    console.log('API Request Body:', req.body);
    next();
  });
}

// API Health Check
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generic email sending endpoint
 * @route POST /email/send
 */
router.post('/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields', 
        requiredFields: ['to', 'subject', 'html OR text'] 
      });
    }

    console.log(`Sending email to ${to}...`);
    const result = await sendEmail({ to, subject, html, text });
    
    if (result.success) {
      console.log(`Email sent successfully to ${to}`);
      return res.status(200).json({ success: true, messageId: result.messageId });
    } else {
      console.error(`Failed to send email to ${to}:`, result.error);
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in email send endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Order update notification endpoint
 * @route POST /email/order-update
 */
router.post('/email/order-update', async (req, res) => {
  try {
    const { order, customerEmail, customerName, status, message } = req.body;
    
    if (!order || !order.orderID || !customerEmail || !status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields', 
        requiredFields: ['order (with orderID)', 'customerEmail', 'status'] 
      });
    }
    
    // Generate email template
    const template = generateOrderUpdateEmail(order, status, message || 'Your order status has been updated.');
    
    // Add customer name to email if provided
    let htmlContent = template.html;
    if (customerName) {
      htmlContent = htmlContent.replace('Hi there,', `Hi ${customerName},`);
    }
    
    // Send the email
    const result = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      html: htmlContent,
      text: template.text
    });
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        messageId: result.messageId,
        status: 'Order update email sent successfully'
      });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error sending order update email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Register game price routes
router.use('/', gamePriceRoutes);

// Handle 404 errors specific to this router
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested API endpoint ${req.originalUrl} does not exist`
  });
});

// Only run standalone server if directly executed
if (require.main === module) {
  // In standalone mode, create full app with security middleware
  const app = express();
  const PORT = process.env.PORT || 5001; // Use different port for standalone mode
  
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", 'https://api.resend.com']
      }
    }
  }));
  
  // Mount the router on the app
  app.use('/', router);
  
  // Start server with error handling
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (error) => {
    console.error('Failed to start API server:', error);
  });
}

// Export the router for use in the main application
module.exports = router; 