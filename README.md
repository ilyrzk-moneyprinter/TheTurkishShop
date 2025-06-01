# The Turkish Shop

An e-commerce web application built with React, Firebase, and Express.

## Setup and Running

### Frontend

1. Navigate to the project directory:
   ```
   cd the-turkish-shop
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React application:
   ```
   npm start
   ```

### Email API Server

To enable email sending functionality, you need to run the dedicated email server:

1. Navigate to the API directory:
   ```
   cd the-turkish-shop/src/api
   ```

2. Install API server dependencies:
   ```
   npm install
   ```

3. Start the email server:
   ```
   npm start
   ```

This will start the email server on port 5002 by default. The server handles:
- Order confirmation emails
- Order status update notifications
- Order delivery emails

### Environment Variables

Create a `.env` file in the project root with the following:

```
# API Settings
PORT=5002

# Email Settings
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=orders@theturkishshop.com

# Development Settings
NODE_ENV=development
```

## Features

- Production-ready email notifications for orders
- API for game price checking
- Secure configuration with rate limiting and CORS protection

## Email Server API Endpoints

### Generic Email
`POST /api/email/send`
```json
{
  "to": "customer@example.com",
  "subject": "Email Subject",
  "html": "<p>HTML content</p>",
  "text": "Plain text content"
}
```

### Order Update Notification
`POST /api/email/order-update`
```json
{
  "order": {
    "orderID": "ORD-123456",
    "status": "Processing",
    "items": [{"product": "Item Name", "amount": "Standard", "quantity": 1, "price": 19.99}],
    "totalPrice": 19.99
  },
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "status": "processing",
  "message": "Your order is now being processed and will be delivered soon."
}
```

## Fixed Issues

- **Vouch Saving**: Fixed the issue with empty date fields causing Firestore errors
- **Email Sending**: Fixed the email service connection by adding a simplified email server

## Real-time Order Queue System

This application includes a complete real-time order queue system for digital product delivery. Here are the key features:

### Order Options

- **Standard Delivery**: Regular processing with 1-3 day delivery window
- **Express Delivery**: Priority processing (+£9) with faster delivery (5-60 minutes)

### Queue Management

- Orders are automatically placed in a priority queue on submission
- Express orders are always processed before Standard orders
- Queue position updates in real-time for users
- Estimated delivery times are calculated based on delivery type and queue position

### Order Status Tracking

- **Queued**: Order is in line to be processed
- **In Progress**: Order is currently being processed
- **Delivered**: Order is complete and delivered
- **Delayed**: Order processing has been delayed
- **Cancelled**: Order has been cancelled

### Real-time Updates

All updates to order status, queue position, and estimated delivery time happen in real-time using Firebase Firestore listeners.

### User Dashboard Features

- Live queue position display
- Real-time status updates
- Animated progress indicator
- Estimated delivery countdown timer
- Order history with delivery type and status filtering

### Admin Features

- Comprehensive queue management system
- Filter orders by delivery type (Express/Standard) and status
- Manual queue position adjustment through drag and drop
- One-click status updates
- Toggle between Express and Standard delivery types
- View all orders in proper queue sequence

## Technical Implementation

- Firebase Firestore for real-time data storage and listeners
- Atomic batch updates for queue position management
- WebSocket-like real-time updates using Firestore snapshots
- Framer Motion animations for smooth UI experience

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure Firebase credentials
4. Start the development server with `npm start`

## Environment Setup

The application requires the following environment variables:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## License

This project is licensed under the MIT License. 