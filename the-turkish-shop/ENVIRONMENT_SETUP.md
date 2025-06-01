# Environment Variables Setup

## Overview
This document explains how to set up environment variables for production deployment of The Turkish Shop.

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

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

## Firebase Hosting Setup

When deploying to Firebase Hosting, you need to set these environment variables in the Firebase dashboard:

1. Go to Firebase Console
2. Select your project
3. Go to Project Settings
4. Click on "Environment Configuration"
5. Add all the environment variables listed above

Alternatively, you can use the Firebase CLI to set environment variables:

```bash
firebase functions:config:set firebase.apikey="YOUR_API_KEY" firebase.authdomain="YOUR_AUTH_DOMAIN" ...
```

## Github Actions Deployment

If you're using Github Actions for CI/CD, add these variables as secrets in your repository:

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" → "Actions"
4. Add each environment variable as a new secret

Example GitHub workflow:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [ main ]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
        env:
          REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
          REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
          # Add all other environment variables here
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: the-turkish-shop
```

## Local Development

For local development, create a `.env.local` file in the project root with the same variables. 
This file should not be committed to git (it's already in the .gitignore).

## Security Notes

- NEVER commit API keys or other secrets to your git repository
- Always use environment variables for sensitive information
- Regularly rotate API keys and update your environment variables
- Make sure your Firebase security rules are properly configured to restrict access to your database 