const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

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

// Simple mock email functions (without requiring any external modules)
const mockEmailService = {
  sendEmail: async ({ to, subject }) => {
    console.log(`[MOCK EMAIL] Would send email to ${to} with subject: ${subject}`);
    return { success: true, messageId: 'mock-email-id' };
  },
  generateOrderUpdateEmail: (order, status, message) => {
    const subject = `Order Update: ${status}`;
    const html = `<p>Order update for ${order?.orderID || 'unknown'}: ${status}</p>`;
    const text = `Order update for ${order?.orderID || 'unknown'}: ${status}`;
    return { subject, html, text };
  }
};

// Use the mock email functions
const sendEmail = mockEmailService.sendEmail;
const generateOrderUpdateEmail = mockEmailService.generateOrderUpdateEmail;

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
    }
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

// Register routes
app.use('/api', gamePriceRoutes);

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
        connectSrc: ["'self'"]
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