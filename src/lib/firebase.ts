/**
 * FIREBASE CLIENT CONFIGURATION
 * 
 * This file initializes the Firebase client SDK for use in the browser.
 * Used for real-time listeners and client-side operations.
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firestore Database (in test mode for development)
 * 3. Add a Web App in Project Settings
 * 4. Copy credentials to .env.local (see .env.example)
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization in development with hot reload)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

db = getFirestore(app);
auth = getAuth(app);

export { app, db, auth };

/**
 * Check if Firebase is properly configured
 * Useful for conditional rendering when Firebase isn't set up yet
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};
