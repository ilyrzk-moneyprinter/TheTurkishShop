import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import siteConfig from '../config/siteConfig';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// First check for environment variables (highest priority)
const envFirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Check if environment variables are available
const hasValidEnvConfig = envFirebaseConfig.apiKey && envFirebaseConfig.projectId;

// Check if siteConfig has valid Firebase configuration
const hasValidSiteConfig = siteConfig.firebase.apiKey && 
  siteConfig.firebase.apiKey.trim() !== '' &&
  siteConfig.firebase.projectId && 
  siteConfig.firebase.projectId.trim() !== '';

// Use environment variables first, fallback to siteConfig, then use hardcoded default
const firebaseConfig = hasValidEnvConfig ? envFirebaseConfig : 
  (hasValidSiteConfig ? siteConfig.firebase : {
    // Default/fallback configuration (for development only - this should never be used in production)
    apiKey: "REPLACE_WITH_ENV_VARIABLE",  
    authDomain: "REPLACE_WITH_ENV_VARIABLE",
    projectId: "REPLACE_WITH_ENV_VARIABLE",
    storageBucket: "REPLACE_WITH_ENV_VARIABLE",
    messagingSenderId: "REPLACE_WITH_ENV_VARIABLE",
    appId: "REPLACE_WITH_ENV_VARIABLE",
    measurementId: "REPLACE_WITH_ENV_VARIABLE"
  });

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