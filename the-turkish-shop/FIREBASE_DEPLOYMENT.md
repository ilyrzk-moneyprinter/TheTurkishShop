# Firebase Deployment Guide for The Turkish Shop

This guide provides step-by-step instructions for deploying The Turkish Shop to Firebase Hosting.

## Prerequisites

- Node.js v18+ 
- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)
- Git repository access

## Setup Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd TheTurkishShop
```

### 2. Environment Configuration

Create a `.env.production` file in the main project directory with the following variables:

```
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_firebase_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# API Configuration
REACT_APP_API_BASE_URL=https://api.theturkishshop.com
REACT_APP_STEAM_API_KEY=your_steam_api_key
REACT_APP_PLAYSTATION_API_KEY=your_playstation_api_key

# Email Service
REACT_APP_RESEND_API_KEY=your_resend_api_key

# Discord Bot
REACT_APP_DISCORD_BOT_TOKEN=your_discord_bot_token
REACT_APP_DISCORD_SERVER_ID=your_discord_server_id
REACT_APP_DISCORD_ORDER_CHANNEL_ID=your_discord_order_channel_id
REACT_APP_DISCORD_SUPPORT_CHANNEL_ID=your_discord_support_channel_id

# Google Analytics
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id

# Currency Exchange Rate API
REACT_APP_EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
```

Get these values from:
- Firebase Console: Project Settings > General > Your Apps
- Firebase Console: Project Settings > Service Accounts (for the service account key)
- Your API providers (Resend, Discord, etc.)

### 3. Install Dependencies

```bash
cd the-turkish-shop
npm install
```

### 4. Build the Production Version

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### 5. Firebase Login

```bash
firebase login
```

### 6. Initialize Firebase (if not already done)

```bash
firebase init
```

During initialization:
1. Select "Hosting" and any other Firebase services you need
2. Choose your Firebase project
3. Specify `build` as the public directory
4. Configure as a single-page app (Yes)
5. Set up GitHub Actions deployments (optional)

### 7. Set Environment Variables in Firebase Functions

If you're using Firebase Functions, set environment variables:

```bash
firebase functions:config:set \
  resend.key="YOUR_RESEND_API_KEY" \
  sendgrid.key="YOUR_SENDGRID_API_KEY" \
  discord.token="YOUR_DISCORD_BOT_TOKEN"
```

### 8. Update firebase.json

Make sure your `firebase.json` is properly configured:

```json
{
  "hosting": {
    "public": "the-turkish-shop/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### 9. Deploy to Firebase

```bash
firebase deploy
```

Alternatively, deploy only specific services:

```bash
firebase deploy --only hosting
firebase deploy --only functions
```

### 10. Set Up Continuous Deployment (Optional)

For GitHub Actions setup, ensure you have the GitHub workflow file at `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: '18'
      - run: cd the-turkish-shop && npm ci
      - run: cd the-turkish-shop && npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
          # Add all other environment variables here
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: the-turkish-shop
```

Add the following secrets to your GitHub repository:
- FIREBASE_SERVICE_ACCOUNT (JSON content from Firebase Project Settings > Service Accounts)
- All REACT_APP_* environment variables

### 11. Verify Deployment

1. Visit your Firebase Hosting URL (e.g., https://the-turkish-shop.web.app)
2. Test all critical functionality:
   - User authentication
   - Product listings
   - Order creation
   - Payment processing
   - Admin functions

### 12. Set Up Domain (Optional)

To use a custom domain:
1. Go to Firebase Console > Hosting > Add custom domain
2. Follow the DNS verification steps
3. Add SSL certificate (automatically provisioned by Firebase)

### Troubleshooting

1. **Build errors**: Check if all dependencies are installed and environment variables are set correctly
2. **Deploy errors**: Make sure you have proper permissions in the Firebase project
3. **API errors**: Verify that environment variables are correctly set and APIs are accessible from Firebase Hosting
4. **Blank screen**: Check browser console for errors, especially around environment variables

### Security Best Practices

1. Use environment variables for all sensitive information
2. Set proper Firebase security rules for Firestore and Storage
3. Configure Content Security Policy headers
4. Enable rate limiting for API endpoints
5. Use HTTPS for all API calls

### Maintenance

1. Regularly update dependencies
2. Monitor Firebase Console for usage and errors
3. Set up Firebase Performance Monitoring
4. Configure Firebase Crashlytics for error tracking 