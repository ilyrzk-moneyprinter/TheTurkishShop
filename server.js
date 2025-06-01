console.log('==== TURKISH SHOP SERVER STARTING ====');
console.log(`Node.js version: ${process.version}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`Environment: NODE_ENV=${process.env.NODE_ENV}, PORT=${process.env.PORT}`);
console.log('Contents of node_modules:', require('fs').existsSync('./node_modules'));

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8080;

console.log(`Starting server with PORT: ${PORT}, NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Current directory: ${__dirname}`);
console.log(`Files in current directory: ${fs.readdirSync(__dirname).join(', ')}`);

// Make sure the PORT env var is honored for Cloud Run
console.log('Re-verifying PORT value to ensure Cloud Run compatibility...');
if (process.env.PORT) {
  console.log(`Using PORT from environment: ${process.env.PORT}`);
} else {
  console.log('PORT environment variable not set, using default: 8080');
}

// Mock email functionality instead of creating a real transporter
console.log('Using mock email service (no SMTP connections)');

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

// Mock Email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required fields. Provide to, subject, and either html or text.' 
      });
    }
    
    // Log the email but don't actually send it
    console.log(`[MOCK EMAIL] Would send email to: ${to}, subject: ${subject}`);
    
    res.json({ success: true, messageId: 'mock-email-id' });
  } catch (error) {
    console.error('Email route error:', error);
    res.status(500).json({ error: 'Failed to process email request' });
  }
});

// Mock Order update notification endpoint
app.post('/api/email/order-update', async (req, res) => {
  try {
    const { order, customerEmail, status, message } = req.body;
    
    if (!order || !customerEmail || !status) {
      return res.status(400).json({ 
        error: 'Missing required fields. Provide order, customerEmail, and status.' 
      });
    }
    
    const subject = `Order ${order.orderID} ${status}`;
    
    // Just log it, don't try to send
    console.log(`[MOCK ORDER EMAIL] Would send order update to: ${customerEmail}, subject: ${subject}, status: ${status}`);
    
    res.json({ success: true, messageId: 'mock-order-email-id' });
  } catch (error) {
    console.error('Order update email error:', error);
    res.status(500).json({ error: 'Failed to process order update email request' });
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

// Ensure we catch any unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// More detailed error logging for server startup
// Create server and bind to port
console.log(`Attempting to start server on port ${PORT}...`);
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`==== SUCCESS: Server running on port ${PORT} ====`);
  console.log('Server is ready to accept connections');
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