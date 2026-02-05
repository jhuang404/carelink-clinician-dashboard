/**
 * TEST FIREBASE CONNECTION
 * 
 * Quick script to verify Firebase Admin SDK is properly configured
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

console.log("🔍 Testing Firebase connection...\n");

// Check if environment variables are set
console.log("Environment variables:");
console.log("  FIREBASE_ADMIN_PROJECT_ID:", process.env.FIREBASE_ADMIN_PROJECT_ID ? "✓ Set" : "✗ Missing");
console.log("  FIREBASE_ADMIN_CLIENT_EMAIL:", process.env.FIREBASE_ADMIN_CLIENT_EMAIL ? "✓ Set" : "✗ Missing");
console.log("  FIREBASE_ADMIN_PRIVATE_KEY:", process.env.FIREBASE_ADMIN_PRIVATE_KEY ? "✓ Set (length: " + process.env.FIREBASE_ADMIN_PRIVATE_KEY.length + ")" : "✗ Missing");
console.log();

if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  console.error("❌ Firebase Admin environment variables are not properly configured!");
  process.exit(1);
}

async function testFirebase() {
  try {
    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });

    console.log("✅ Firebase Admin initialized successfully!");
    console.log();

    const db = getFirestore(app);

    // Test reading patients
    console.log("📋 Testing patients collection...");
    const patientsSnapshot = await db.collection("patients").limit(5).get();
    console.log(`  Found ${patientsSnapshot.size} patients`);
    
    patientsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`    - ${data.firstName} ${data.lastName} (${doc.id})`);
    });
    console.log();

    // Test reading readings
    console.log("📊 Testing readings collection...");
    const readingsSnapshot = await db.collection("readings").limit(5).get();
    console.log(`  Found ${readingsSnapshot.size} readings`);
    console.log();

    // Test reading notes
    console.log("📝 Testing clinicianNotes collection...");
    const notesSnapshot = await db.collection("clinicianNotes").limit(5).get();
    console.log(`  Found ${notesSnapshot.size} notes`);
    console.log();

    // Test reading alerts
    console.log("🚨 Testing alerts collection...");
    const alertsSnapshot = await db.collection("alerts").limit(5).get();
    console.log(`  Found ${alertsSnapshot.size} alerts`);
    console.log();

    console.log("✅ All Firebase collections are accessible!");
    console.log("\n🎉 Firebase connection test passed!");

  } catch (error) {
    console.error("❌ Error connecting to Firebase:", error);
    process.exit(1);
  }
}

testFirebase();
