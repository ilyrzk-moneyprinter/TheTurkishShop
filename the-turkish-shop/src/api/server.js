const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { sendEmail, generateOrderUpdateEmail } = require('./emailService');

// Import routes
const gamePriceRoutes = require('./routes/gamePrice');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create Express app
const app = express();
const PORT = process.env.PORT || 5002;

// Security & middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.resend.com']
    }
  }
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  'https://theturkishshop.com',
  'https://www.theturkishshop.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Logging
app.use(morgan('dev'));

// Debug middleware in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    console.log('Request Method:', req.method);
    console.log('Request Body:', req.body);
    next();
  });
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Generic email sending endpoint
 * @route POST /api/email/send
 */
app.post('/api/email/send', async (req, res) => {
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
 * @route POST /api/email/order-update
 */
app.post('/api/email/order-update', async (req, res) => {
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

// Register routes
app.use('/api', gamePriceRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle CORS errors specifically
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Origin not allowed by CORS policy'
    });
  }

  // Handle rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing 