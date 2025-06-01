const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
// const { sendEmail } = require('./emailService'); // Commented out - email service not available
const discordBot = require('./discord-bot');

// Import routes
const gamePriceRoutes = require('./routes/gamePrice');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Configure body parser to handle JSON properly
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Apply middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'], // Allow React dev server
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(helmet({ contentSecurityPolicy: false })); // Set security headers with CSP disabled for testing
app.use(morgan('dev')); // Request logging

// Debug middleware
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Body:', req.body);
  next();
});

// Apply rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.'
  }
});
app.use('/api/', apiLimiter);

// Mount routes
app.use('/api', gamePriceRoutes);

// Initialize Discord bot
discordBot.start();

// Routes
// Email endpoint commented out - handled by frontend
/*
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        error: 'Missing required fields. Provide to, subject, and either html or text.' 
      });
    }
    
    const result = await sendEmail({ to, subject, html, text });
    
    if (result.success) {
      res.json({ success: true, messageId: result.messageId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Email route error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});
*/

// Discord notification endpoint
app.post('/api/discord/order-notification', async (req, res) => {
  try {
    const order = req.body;
    await discordBot.sendOrderNotification(order);
    res.json({ success: true });
  } catch (error) {
    console.error('Discord notification error:', error);
    res.status(500).json({ error: 'Failed to send Discord notification' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    discord: discordBot.client.isReady() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: 'An unexpected error occurred'
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // Export for testing 