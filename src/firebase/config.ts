import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA_THzJ6K2JmgfQzk6Fxc2oY6337m-9b3w",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "the-turkish-shop.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "the-turkish-shop",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "the-turkish-shop.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "447958991873",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:447958991873:web:28c8b83f53d8018ea5ac00",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-REM24ZKRRF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app; 