/**
 * Debug BP display issue
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

async function debugBPDisplay() {
  console.log("Checking BP data for each patient...\n");
  
  const patients = ["P-2025-001", "P-2025-002", "P-2025-003", "P-2025-004"];
  
  for (const patientId of patients) {
    const snapshot = await db.collection("readings")
      .where("patientId", "==", patientId)
      .limit(3)
      .get();
    
    console.log(`\n${patientId} - Found ${snapshot.size} readings:`);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  ${doc.id}:`);
      console.log(`    systolic: ${data.systolic} (type: ${typeof data.systolic})`);
      console.log(`    diastolic: ${data.diastolic} (type: ${typeof data.diastolic})`);
      console.log(`    Raw data:`, JSON.stringify(data));
      console.log(`    Display would be: "${data.systolic}/${data.diastolic}"`);
    });
  }
  
  process.exit(0);
}

debugBPDisplay();
