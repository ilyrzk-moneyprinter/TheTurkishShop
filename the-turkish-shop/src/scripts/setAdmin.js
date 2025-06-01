// Script to set a specific user as the sole admin
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

// Initialize Firebase Admin with application default credentials
admin.initializeApp({
  credential: admin.credential.cert(require(path.join(__dirname, '../../../the-turkish-shop-firebase-adminsdk-fbsvc-c38295c5fc.json'))),
  projectId: "the-turkish-shop"
});

const db = getFirestore();
const auth = getAuth();

const USERS_COLLECTION = 'users';
const ADMIN_EMAIL = 'senpaimc04@gmail.com';
const DEFAULT_PASSWORD = 'ChangeMe123!'; // Temporary password that should be changed immediately

async function makeUserAdmin() {
  try {
    console.log(`Starting process to make ${ADMIN_EMAIL} the sole admin...`);
    
    // Check if user already exists in Firebase Auth
    let userId = null;
    try {
      const userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
      userId = userRecord.uid;
      console.log(`User already exists with ID: ${userId}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Create the user if they don't exist
        console.log(`Creating new user with email ${ADMIN_EMAIL}...`);
        const userRecord = await auth.createUser({
          email: ADMIN_EMAIL,
          password: DEFAULT_PASSWORD,
          emailVerified: true
        });
        userId = userRecord.uid;
        console.log(`User created successfully with ID: ${userId}`);
      } else {
        throw error;
      }
    }
    
    // Remove admin role from all users and set the target user as admin
    console.log('Updating user roles in Firestore...');
    
    const usersSnapshot = await db.collection(USERS_COLLECTION).get();
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (userDoc.id === userId) {
        // Update target user to admin
        await db.collection(USERS_COLLECTION).doc(userDoc.id).set({
          uid: userDoc.id,
          email: ADMIN_EMAIL,
          role: 'admin',
          createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Set ${ADMIN_EMAIL} as admin`);
      } else if (userData.role === 'admin') {
        // Remove admin role from other users
        await db.collection(USERS_COLLECTION).doc(userDoc.id).update({
          role: 'customer'
        });
        console.log(`Removed admin role from ${userData.email}`);
      }
    }
    
    // If user document doesn't exist in Firestore, create it
    const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      await userDocRef.set({
        uid: userId,
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Created new admin user document in Firestore`);
    }
    
    console.log(`Successfully set ${ADMIN_EMAIL} as the only admin user`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
makeUserAdmin()
  .then(() => console.log('Operation completed.'))
  .catch(error => console.error('Fatal error:', error))
  .finally(() => process.exit()); 