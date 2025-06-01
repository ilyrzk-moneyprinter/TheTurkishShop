# The Turkish Shop Configuration Guide

## Overview
All site settings are centralized in `/src/config/siteConfig.ts`. This is your single source of truth for all configuration options.

## Quick Start

1. Open `/src/config/siteConfig.ts`
2. Fill in all the empty strings ("") with your actual values
3. Save the file and restart your development server

## Configuration Sections

### 🌐 Basic Site Information
```typescript
siteName: "The Turkish Shop",
siteUrl: "https://theturkishshop.com",
supportEmail: "contact@theturkishshop.com",
legalEmail: "legal@theturkishshop.com"
```

### 💳 PayPal Configuration (Rotating Accounts)
The system automatically rotates through PayPal accounts for each new order:

```typescript
paypal: {
  accounts: [
    {
      email: "account1@example.com",
      link: "https://paypal.me/account1",
      name: "Account 1"
    },
    // Add up to 5 accounts
  ]
}
```

**How rotation works:**
- Each new order gets the next account in the list
- After account 5, it goes back to account 1
- This helps distribute payments across multiple accounts

### 🔑 Firebase Configuration
Get these values from Firebase Console > Project Settings:

```typescript
firebase: {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
}
```

### 💬 Discord Configuration
```typescript
discord: {
  inviteLink: "https://discord.gg/yourserver",
  username: "yourdiscordusername",
  botToken: "your-bot-token", // From Discord Developer Portal
  serverId: "your-server-id",
  orderChannelId: "channel-for-orders",
  supportChannelId: "channel-for-support"
}
```

### 📧 Email Service (Resend)
```typescript
email: {
  resendApiKey: "your-resend-api-key", // Get from resend.com
  fromEmail: "noreply@yourdomain.com",
  orderNotificationEmail: "orders@yourdomain.com"
}
```

### 🎮 API Configuration
```typescript
api: {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://api.yourdomain.com' 
    : 'http://localhost:5001',
  steamApiKey: "your-steam-api-key", // For game price fetching
  playstationApiKey: "" // If you have one
}
```

### 🚀 Feature Flags
Enable/disable features without code changes:

```typescript
features: {
  liveChat: true,              // Show/hide live chat bubble
  promoCodesEnabled: true,     // Enable promo codes
  reviewsEnabled: true,        // Show reviews section
  expressDeliveryEnabled: true, // Offer express delivery
  multiCurrencyEnabled: true,  // Multiple currency support
  emailNotificationsEnabled: true,
  discordBotEnabled: true,
  maintenanceMode: false       // Enable to show maintenance page
}
```

### 🛠️ Maintenance Mode
When `maintenanceMode` is true:

```typescript
maintenance: {
  message: "We're currently performing maintenance. We'll be back shortly!",
  estimatedEndTime: "2024-01-01T12:00:00Z"
}
```

## Important Notes

### PayPal Rotation
- The system tracks which account was used last
- Each order automatically gets the next account
- Make sure all 5 accounts are active and verified
- Update the links if you change PayPal usernames

### Security
- **NEVER** commit API keys to GitHub
- Use environment variables for production
- Keep Firebase rules strict
- Rotate PayPal accounts regularly

### Testing
1. Start with test/sandbox accounts
2. Verify all payment flows work
3. Test with small amounts first
4. Check email notifications

## Common Issues

### PayPal Not Rotating
- Check that all 5 accounts are configured
- Verify each has email and link
- Restart the server after changes

### Firebase Connection Issues
- Verify all Firebase config values
- Check Firebase project is active
- Ensure Firestore is enabled

### Email Not Sending
- Verify Resend API key is correct
- Check from email is verified in Resend
- Look for errors in browser console

## Adding New Features

To add a new payment method:
1. Add configuration in `siteConfig.ts`
2. Update `PaymentSection.tsx` to use it
3. Add feature flag to enable/disable

To add new product types:
1. Add to `products` section in config
2. Update relevant product pages
3. Add delivery instructions

## Support

For configuration help:
- Check browser console for errors
- Verify all required fields are filled
- Contact support with specific error messages 