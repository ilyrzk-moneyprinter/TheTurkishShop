import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential,
  updateProfile,
  onAuthStateChanged,
  signInWithPopup,
  OAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { User, UserRole } from './types';

const USERS_COLLECTION = 'users';

/**
 * Register a new user
 */
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Create user document in Firestore
    const userData: User = {
      uid: user.uid,
      email: user.email || email,
      role: 'customer', // Default role
      createdAt: Timestamp.now()
    };
    
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
    
    return userData;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Sign in a user
 */
export const signInUser = async (email: string, password: string): Promise<UserCredential> => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Sign in with Discord
 */
export const signInWithDiscord = async (): Promise<UserCredential> => {
  try {
    const provider = new OAuthProvider('discord.com');
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Process Discord sign-in result and create/update user in Firestore
 */
export const processDiscordSignIn = async (result: UserCredential): Promise<User> => {
  const { user } = result;
  
  // Check if user already exists
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  
  if (userDoc.exists()) {
    // Update existing user
    return userDoc.data() as User;
  } else {
    // Create new user
    const userData: User = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      role: 'customer',
      createdAt: Timestamp.now()
    };
    
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
    return userData;
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Get the currently authenticated user with Firestore data
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const user = auth.currentUser;
  
  if (!user) {
    return null;
  }
  
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return userDoc.data() as User;
};

/**
 * Check if the current user is an admin
 */
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.role === 'admin';
};

/**
 * Set a user's role (admin only)
 */
export const setUserRole = async (uid: string, role: UserRole): Promise<void> => {
  // Check if current user is admin
  const isCurrentUserAdmin = await isAdmin();
  
  if (!isCurrentUserAdmin) {
    throw new Error('Unauthorized: Only admins can change user roles');
  }
  
  await setDoc(doc(db, USERS_COLLECTION, uid), { role }, { merge: true });
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

/**
 * Setup auth state listener
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, firebaseUser.uid));
      if (userDoc.exists()) {
        callback(userDoc.data() as User);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// Create or update user document with admin role
export const createAdminUser = async (user: FirebaseUser): Promise<void> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'admin', // Set as admin
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('Admin user document created/updated');
  } catch (error) {
    console.error('Error creating admin user document:', error);
  }
};

/**
 * Ensure the current user has admin role in Firestore
 * This is a helper function to fix admin permissions
 */
export const ensureAdminRole = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No user is currently signed in');
      return false;
    }
    
    // Check if the user email is the admin email
    if (user.email === 'senpaimc04@gmail.com') {
      const userRef = doc(db, USERS_COLLECTION, user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
        console.log('Setting admin role for user:', user.email);
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || '',
          role: 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        console.log('Admin role set successfully');
        return true;
      }
      
      console.log('User already has admin role');
      return true;
    }
    
    console.log('User email is not the admin email');
    return false;
  } catch (error) {
    console.error('Error ensuring admin role:', error);
    return false;
  }
}; 