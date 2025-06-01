# Admin Setup Guide for The Turkish Shop

## Quick Fix for "Missing or insufficient permissions" Error

This error occurs when trying to initialize the database or set up admin permissions. Here are three ways to fix it:

### Method 1: Using Firebase Console (Easiest)

1. **Go to Firebase Console**:
   - Visit https://console.firebase.google.com
   - Select your project: `the-turkish-shop`

2. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left menu
   - Click on the "users" collection

3. **Find or Create Your User Document**:
   - Look for a document with your user ID (you can find this in Authentication tab)
   - If it doesn't exist, create a new document with ID = your user ID

4. **Set Admin Role**:
   Add these fields to the document:
   ```json
   {
     "uid": "your-user-id",
     "email": "senpaimc04@gmail.com",
     "role": "admin",
     "createdAt": [timestamp],
     "updatedAt": [timestamp]
   }
   ```

5. **Sign Out and Sign In Again**:
   - Sign out of the application
   - Sign in again with senpaimc04@gmail.com
   - The admin permissions should now work

### Method 2: Using the Setup Initial Admin Button (After Fix)

1. **Make sure you're signed in** as senpaimc04@gmail.com
2. **Navigate to** `/admin/database-init`
3. **Click "Setup Initial Admin"**
4. **Wait for success message**
5. **Page will refresh automatically**

### Method 3: Using Admin SDK Script

1. **Download Service Account Key**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in the `scripts` folder

2. **Install Firebase Admin SDK**:
   ```bash
   cd the-turkish-shop/scripts
   npm install firebase-admin
   ```

3. **Run the Setup Script**:
   ```bash
   node setup-admin.js
   ```

4. **Sign out and sign in again** to apply changes

## Troubleshooting

### If you still get permission errors:

1. **Check Firestore Rules are Deployed**:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Verify Your Email**:
   - Make sure you're signed in with exactly `senpaimc04@gmail.com`
   - Check for typos or extra spaces

3. **Clear Browser Cache**:
   - Sometimes Firebase auth tokens get cached
   - Try incognito/private browsing mode

4. **Check Network Tab**:
   - Open browser developer tools
   - Look for failed requests to Firestore
   - Check the error details

### Common Issues:

- **"No user found with email"**: The user needs to sign up first before being made admin
- **"Permission denied"**: The Firestore rules haven't been deployed or user isn't authenticated
- **"Missing or insufficient permissions"**: The user document doesn't have admin role set

## Security Note

The temporary permission for `senpaimc04@gmail.com` in the Firestore rules should be removed after initial setup:

1. Edit `firestore.rules`
2. Remove the `isSetupUser()` function and its usage
3. Deploy the updated rules

## Need More Help?

1. Check the Firebase Console logs for detailed error messages
2. Ensure your Firebase project is properly configured
3. Make sure you're on the correct Firebase project (check `firebase use`) 