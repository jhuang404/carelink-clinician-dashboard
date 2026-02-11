/**
 * Quick script to check Firebase data
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  }),
});

const db = getFirestore(app);

async function checkData() {
  console.log("Checking Firebase data...\n");
  
  // Check patients
  const patientsSnapshot = await db.collection("patients").get();
  console.log(`Found ${patientsSnapshot.size} patients:`);
  patientsSnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`  ${doc.id}: ${data.firstName} ${data.lastName}`);
    console.log(`    - lastContact: ${data.lastContact || 'NOT SET'}`);
    console.log(`    - riskLevel: ${data.riskLevel}`);
  });
  
  console.log("\nChecking readings...");
  const readingsSnapshot = await db.collection("readings").limit(5).get();
  console.log(`Found ${readingsSnapshot.size} readings (showing first 5):`);
  readingsSnapshot.forEach((doc) => {
    const data = doc.data();
    console.log(`  ${data.patientId}: ${data.systolic}/${data.diastolic} at ${data.timestamp}`);
  });
  
  process.exit(0);
}

checkData();
