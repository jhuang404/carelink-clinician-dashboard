/**
 * FIREBASE ADMIN SDK CONFIGURATION
 * 
 * This file initializes the Firebase Admin SDK for server-side operations.
 * Used in API routes for secure database operations.
 * 
 * IMPORTANT: Admin SDK has full access to your Firebase project.
 * Never expose admin credentials to the client.
 * 
 * Setup Instructions:
 * 1. Go to Firebase Console > Project Settings > Service Accounts
 * 2. Click "Generate new private key"
 * 3. Copy the values to .env.local (see .env.example)
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App;
let adminDb: Firestore;

// Check if Firebase Admin is configured
const isAdminConfigured = !!(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

if (isAdminConfigured) {
  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Replace escaped newlines in the private key
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }
  adminDb = getFirestore(adminApp);
}

export { adminApp, adminDb, isAdminConfigured };

/**
 * Get a reference to a Firestore collection
 * Throws if Firebase Admin is not configured
 */
export const getCollection = (collectionName: string) => {
  if (!isAdminConfigured || !adminDb) {
    throw new Error(
      "Firebase Admin is not configured. Please set up environment variables."
    );
  }
  return adminDb.collection(collectionName);
};
