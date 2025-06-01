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
const PORT = process.env.PORT || 5002;

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
app.use(helmet());
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 