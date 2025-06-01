import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import siteConfig from '../config/siteConfig';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Check if siteConfig has valid Firebase configuration (not just empty strings)
const hasValidFirebaseConfig = siteConfig.firebase.apiKey && 
  siteConfig.firebase.apiKey.trim() !== '' &&
  siteConfig.firebase.projectId && 
  siteConfig.firebase.projectId.trim() !== '';

const firebaseConfig = hasValidFirebaseConfig ? siteConfig.firebase : {
  // Default/fallback configuration if not set in siteConfig
  apiKey: "AIzaSyBkx3jzILZLdE0qlgQ5VZbJlmOlLZHJHnA",
  authDomain: "theturkishshop-7e578.firebaseapp.com",
  projectId: "theturkishshop-7e578",
  storageBucket: "theturkishshop-7e578.appspot.com",
  messagingSenderId: "862169154282",
  appId: "1:862169154282:web:1ad1e24fd8c0e44f29a303",
  measurementId: "G-QV6XKSEM7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 