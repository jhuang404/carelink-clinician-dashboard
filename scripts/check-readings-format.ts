/**
 * Check readings data format
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

async function checkReadingsFormat() {
  console.log("Checking readings format for each patient...\n");
  
  const patients = ["P-2025-001", "P-2025-002", "P-2025-003", "P-2025-004"];
  
  for (const patientId of patients) {
    const snapshot = await db.collection("readings")
      .where("patientId", "==", patientId)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const reading = snapshot.docs[0].data();
      console.log(`${patientId}:`);
      console.log(`  Systolic: ${reading.systolic} (type: ${typeof reading.systolic})`);
      console.log(`  Diastolic: ${reading.diastolic} (type: ${typeof reading.diastolic})`);
      console.log(`  Display: ${reading.systolic}/${reading.diastolic}`);
      console.log();
    }
  }
  
  process.exit(0);
}

checkReadingsFormat();
