const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

console.log(`Starting server with PORT: ${PORT}, NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Current directory: ${__dirname}`);
console.log(`Files in current directory: ${fs.readdirSync(__dirname).join(', ')}`);

// Configure email transporter
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.resend.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || 'resend',
      pass: process.env.EMAIL_PASSWORD || 're_UBRuxCtM_EXUYqZfcXc4va6o4sbfgQaw4'
    }
  });
  console.log('Email transporter created successfully');
} catch (error) {
  console.error('Failed to create email transporter:', error);
}

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
    
    if (!transporter) {
      console.error('Email transporter not available');
      return res.status(500).json({ error: 'Email service not configured' });
    }
    
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
    
    if (!transporter) {
      console.error('Email transporter not available');
      return res.status(500).json({ error: 'Email service not configured' });
    }
    
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
  const nestedApiPath = path.join(__dirname, 'the-turkish-shop', 'src', 'api', 'server.js');
  
  console.log(`Checking for nested API at path: ${nestedApiPath}`);
  console.log(`Path exists: ${fs.existsSync(nestedApiPath)}`);
  
  if (fs.existsSync(nestedApiPath)) {
    const apiRouter = require(nestedApiPath);
    app.use('/api', apiRouter);
    console.log('Successfully loaded nested API routes');
  } else {
    console.log('Nested API file not found at expected path');
  }
} catch (error) {
  console.log('Error loading nested API routes:', error.message);
}

// Serve static files from the React app build directory
const reactBuildPath = path.join(__dirname, 'the-turkish-shop/build');
console.log(`Checking for React build at: ${reactBuildPath}`);
console.log(`Path exists: ${fs.existsSync(reactBuildPath)}`);

if (fs.existsSync(reactBuildPath)) {
  app.use(express.static(reactBuildPath));
  console.log('Serving static files from React build directory');
  
  // For any request that doesn't match an API route or static file, send the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
  });
} else {
  console.log('React build directory not found');
}

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

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app; 