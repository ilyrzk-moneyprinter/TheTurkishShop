// Setup Admin Script
// Run this script to manually set up the admin user
// Usage: node scripts/setup-admin.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://the-turkish-shop.firebaseio.com"
});

const db = admin.firestore();

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail('senpaimc04@gmail.com');
    console.log('Found user:', userRecord.uid);
    
    // Set admin role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || '',
      photoURL: userRecord.photoURL || '',
      role: 'admin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    
    console.log('Successfully set up admin user!');
    console.log('User will need to sign out and sign in again for changes to take effect.');
    
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
  
  process.exit(0);
}

setupAdmin(); 