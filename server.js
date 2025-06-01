const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

console.log(`Starting server with PORT: ${PORT}, NODE_ENV: ${process.env.NODE_ENV}`);

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.resend.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'resend',
    pass: process.env.EMAIL_PASSWORD || 're_UBRuxCtM_EXUYqZfcXc4va6o4sbfgQaw4'
  }
});

// Security & middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'https://api.resend.com', 'https://*.googleapis.com', 'https://*.firebaseio.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'data:']
    }
  }
}));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Root route for Cloud Run health checks
app.get('/_health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required fields. Provide to, subject, and either html or text.' 
      });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'orders@theturkishshop.com',
      to,
      subject,
      html,
      text
    };
    
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email route error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Order update notification endpoint
app.post('/api/email/order-update', async (req, res) => {
  try {
    const { order, customerEmail, status, message } = req.body;
    
    if (!order || !customerEmail || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields. Provide order, customerEmail, and status.' 
      });
    }
    
    const subject = `Order ${order.orderID} ${status}`;
    
    // Simple HTML template for order updates
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">The Turkish Shop</h1>
          <p style="margin: 10px 0 0 0;">Order Update</p>
        </div>
        <div style="padding: 30px; background-color: #f5f5f5;">
          <h2 style="color: #333;">Your Order Status: ${status}</h2>
          <p style="color: #666;">Order ID: ${order.orderID}</p>
          <p style="color: #666;">${message || 'Your order status has been updated.'}</p>
        </div>
        <div style="background-color: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} The Turkish Shop. All rights reserved.</p>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'orders@theturkishshop.com',
      to: customerEmail,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Order update email error:', error);
    res.status(500).json({ error: 'Failed to send order update email' });
  }
});

// Try to load the nested API routes if available
try {
  // Check if nested API router exists and import it
  const apiRouter = require('./the-turkish-shop/src/api/server');
  app.use('/api', apiRouter);
  console.log('Successfully loaded nested API routes');
} catch (error) {
  console.log('No nested API routes found or error loading them:', error.message);
}

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'the-turkish-shop/build')));

// For any request that doesn't match an API route or static file, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'the-turkish-shop/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Create server and bind to port
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app; 