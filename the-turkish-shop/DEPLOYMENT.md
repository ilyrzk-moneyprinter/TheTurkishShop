# The Turkish Shop - Deployment Guide

## Prerequisites

- Node.js 18+ and npm
- Firebase CLI installed globally
- Domain name configured
- SSL certificate

## Deployment Steps

### 1. Environment Setup

Create a `.env.production` file with the following variables:

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-production-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-production-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-production-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-production-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-production-sender-id
REACT_APP_FIREBASE_APP_ID=your-production-app-id

# API Configuration
REACT_APP_API_URL=https://api.theturkishshop.com

# Email Service
REACT_APP_RESEND_API_KEY=your-resend-api-key

# Google Analytics
REACT_APP_GA_MEASUREMENT_ID=your-ga-measurement-id
```

### 2. Build for Production

```bash
# Install dependencies
npm install

# Build the production bundle
npm run build

# Test the production build locally
npx serve -s build
```

### 3. Firebase Deployment

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Firebase Functions (if any)
firebase deploy --only functions
```

### 4. API Server Deployment

The API server can be deployed to various platforms:

#### Option A: Heroku

```bash
# Create Heroku app
heroku create theturkishshop-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set RESEND_API_KEY=your-key
heroku config:set DISCORD_BOT_TOKEN=your-token

# Deploy
git push heroku main
```

#### Option B: DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure environment variables
3. Set build command: `npm install`
4. Set run command: `node src/api/server.js`

#### Option C: AWS EC2

```bash
# SSH into your EC2 instance
ssh ec2-user@your-instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs

# Clone repository
git clone https://github.com/your-repo/theturkishshop.git

# Install PM2
npm install -g pm2

# Start the API server
pm2 start src/api/server.js --name "turkish-shop-api"
pm2 save
pm2 startup
```

### 5. Database Security Rules

Update Firebase Security Rules for production:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders - only authenticated users can read their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.buyerEmail || 
         request.auth.token.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
    
    // Users - only admins and the user themselves
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin');
      allow update: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

### 6. Domain Configuration

#### For Firebase Hosting:

```bash
# Add custom domain
firebase hosting:sites:create theturkishshop
firebase hosting:channel:deploy production
```

#### DNS Settings:

- A Record: `@` → Firebase Hosting IP
- CNAME: `www` → `theturkishshop.com`
- CNAME: `api` → Your API server domain

### 7. SSL Configuration

Firebase Hosting automatically provisions SSL certificates. For custom API server:

```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.theturkishshop.com
```

### 8. Performance Optimization

1. **Enable Gzip compression** in Firebase hosting config:
```json
{
  "hosting": {
    "headers": [{
      "source": "**/*.@(js|css|html)",
      "headers": [{
        "key": "Content-Encoding",
        "value": "gzip"
      }]
    }]
  }
}
```

2. **Configure CDN** for static assets
3. **Enable Firebase Performance Monitoring**

### 9. Monitoring Setup

1. **Firebase Crashlytics** for error tracking
2. **Google Analytics** for user behavior
3. **Uptime monitoring** with Pingdom or UptimeRobot
4. **Log aggregation** with LogRocket or Sentry

### 10. Backup Strategy

```bash
# Automated Firestore backup
gcloud firestore export gs://your-backup-bucket/$(date +%Y%m%d)

# Schedule daily backups
0 2 * * * /path/to/backup-script.sh
```

### 11. Security Checklist

- [ ] Environment variables secured
- [ ] Firebase security rules configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation active
- [ ] XSS protection enabled
- [ ] HTTPS enforced
- [ ] Security headers configured

### 12. Post-Deployment

1. **Test all features** in production
2. **Monitor error logs** for the first 24 hours
3. **Check performance metrics**
4. **Verify email delivery**
5. **Test payment processing**
6. **Confirm Discord bot connectivity**

### 13. Rollback Procedure

```bash
# Firebase Hosting rollback
firebase hosting:releases:list
firebase hosting:rollback

# API server rollback (if using Git)
git revert HEAD
git push origin main
```

### 14. Maintenance Mode

Create a maintenance page and update Firebase hosting rules:

```json
{
  "hosting": {
    "rewrites": [{
      "source": "**",
      "destination": "/maintenance.html"
    }]
  }
}
```

## Troubleshooting

### Common Issues:

1. **CORS errors**: Check API server CORS configuration
2. **Firebase permission denied**: Review security rules
3. **Email not sending**: Verify Resend API key
4. **Payment issues**: Check PayPal configuration
5. **Performance issues**: Review bundle size and lazy loading

### Support Resources:

- Firebase Documentation: https://firebase.google.com/docs
- React Documentation: https://reactjs.org/docs
- Discord Developer Portal: https://discord.com/developers

## Contact

For deployment support, contact: support@theturkishshop.com 