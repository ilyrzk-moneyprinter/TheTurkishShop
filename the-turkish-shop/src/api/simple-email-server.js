const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sendEmail } = require('./emailService');

// Create Express app
const app = express();
const PORT = 5002;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Debug middleware
app.use((req, res, next) => {
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Body:', req.body);
  next();
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Email server is running' });
});

// Email route
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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

// Start server
app.listen(PORT, () => {
  console.log(`Simple email server running on port ${PORT}`);
}); 