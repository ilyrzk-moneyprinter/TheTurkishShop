# Database Setup Guide

This guide will help you set up the Firebase database collections for The Turkish Shop.

## Prerequisites

1. Firebase project created and configured
2. Admin user account created
3. Firebase configuration properly set in `siteConfig.ts`

## Step 1: Apply Firestore Security Rules

1. Go to your Firebase Console
2. Navigate to Firestore Database > Rules
3. Replace the existing rules with the content from `firestore.rules` file
4. Click "Publish"

## Step 2: Create Admin User

1. Sign up for a new account on your website
2. Go to Firebase Console > Firestore Database
3. Find your user document in the `users` collection
4. Add a field `role` with value `admin` to your user document

## Step 3: Initialize Database Collections

### Option A: Using the Admin Panel (Recommended)

1. Sign in with your admin account
2. Navigate to Admin Dashboard (`/admin`)
3. Click on "Database Setup"
4. Click "Initialize Empty Collections"
5. The system will create sample products and testimonials

### Option B: Manual Setup

If you prefer to set up manually, create the following collections in Firestore:

#### Products Collection
Create a collection named `products` with documents containing:
```json
{
  "name": "Product Name",
  "description": "Product description",
  "imageURL": "https://example.com/image.jpg",
  "inStock": true,
  "featured": false,
  "tiers": [
    {
      "id": "tier_1",
      "name": "Basic Tier",
      "price": "9.99",
      "description": "Basic tier description",
      "inStock": true
    }
  ],
  "createdAt": "Server Timestamp",
  "updatedAt": "Server Timestamp"
}
```

#### Vouches Collection
Create a collection named `vouches` with documents containing:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "platform": "Website",
  "rating": 5,
  "message": "Great service!",
  "status": "approved",
  "isManual": false,
  "createdAt": "Server Timestamp"
}
```

## Step 4: Verify Setup

1. Navigate to Admin Dashboard > Product Management
   - You should see the sample products
   - Try creating a new product

2. Navigate to Admin Dashboard > Vouch Management
   - You should see the sample testimonials
   - Try approving/rejecting testimonials

3. Check the public pages:
   - Products page should display available products
   - Vouches page should show approved testimonials

## Troubleshooting

### "Failed to load products" Error
- Check Firebase console for any permission errors
- Ensure your user has the `admin` role
- Verify Firestore rules are properly applied

### "Permission Denied" Errors
- Make sure you're signed in with an admin account
- Check that the `role: admin` field is set in your user document
- Verify Firebase configuration in `siteConfig.ts`

### Collections Not Created
- Ensure you have proper write permissions
- Check browser console for detailed error messages
- Try the "Force Initialize" option if collections exist but are empty

## Security Considerations

1. Only users with `role: admin` can:
   - Create/edit/delete products
   - Manage vouches
   - View all orders
   - Access admin dashboard

2. Regular users can:
   - View products
   - Submit vouches
   - View their own orders

3. Public access:
   - View products
   - View approved vouches
   - Check promo codes

## Next Steps

After database setup:
1. Configure payment methods in `siteConfig.ts`
2. Set up email service credentials
3. Add real products through the admin panel
4. Configure Discord bot (optional)
5. Deploy to production 