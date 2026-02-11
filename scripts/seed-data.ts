/**
 * SEED DATA SCRIPT
 * 
 * Populates Firestore with sample patient data for development and testing.
 * Run with: npx tsx scripts/seed-data.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  }),
});

const db = getFirestore(app);

// Sample data
const now = new Date();

const patients = [
  {
    id: "P-2025-001",
    firstName: "Robert",
    lastName: "Anderson",
    dateOfBirth: "1958-03-15",
    gender: "male" as const,
    phone: "(555) 123-4567",
    email: "robert.anderson@email.com",
    address: {
      street: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
    },
    emergencyContact: {
      name: "Mary Anderson",
      relationship: "Spouse",
      phone: "(555) 123-4568",
    },
    diagnosis: ["Hypertension", "Type 2 Diabetes"],
    riskLevel: "high" as const,
    targetSystolic: 130,
    targetDiastolic: 80,
    medications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        startDate: "2024-01-15",
      },
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        startDate: "2024-01-15",
      },
    ],
    assignedClinicianId: "clinician-001",
    createdAt: new Date("2025-01-15").toISOString(),
    updatedAt: now.toISOString(),
    lastContact: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: "active" as const,
  },
  {
    id: "P-2025-002",
    firstName: "Maria",
    lastName: "Garcia",
    dateOfBirth: "1965-07-22",
    gender: "female" as const,
    phone: "(555) 234-5678",
    email: "maria.garcia@email.com",
    address: {
      street: "456 Oak Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
    },
    emergencyContact: {
      name: "Carlos Garcia",
      relationship: "Son",
      phone: "(555) 234-5679",
    },
    diagnosis: ["Hypertension", "High Cholesterol"],
    riskLevel: "moderate" as const,
    targetSystolic: 130,
    targetDiastolic: 80,
    medications: [
      {
        name: "Amlodipine",
        dosage: "5mg",
        frequency: "Once daily",
        startDate: "2024-02-01",
      },
    ],
    assignedClinicianId: "clinician-001",
    createdAt: new Date("2025-01-20").toISOString(),
    updatedAt: now.toISOString(),
    lastContact: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    status: "active" as const,
  },
  {
    id: "P-2025-003",
    firstName: "James",
    lastName: "Wilson",
    dateOfBirth: "1972-11-08",
    gender: "male" as const,
    phone: "(555) 345-6789",
    email: "james.wilson@email.com",
    address: {
      street: "789 Pine Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94104",
    },
    diagnosis: ["Hypertension"],
    riskLevel: "critical" as const,
    targetSystolic: 130,
    targetDiastolic: 80,
    medications: [
      {
        name: "Losartan",
        dosage: "50mg",
        frequency: "Once daily",
        startDate: "2024-01-10",
      },
    ],
    assignedClinicianId: "clinician-001",
    createdAt: new Date("2025-01-10").toISOString(),
    updatedAt: now.toISOString(),
    lastContact: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (critical patient)
    status: "active" as const,
  },
  {
    id: "P-2025-004",
    firstName: "Linda",
    lastName: "Chen",
    dateOfBirth: "1968-05-30",
    gender: "female" as const,
    phone: "(555) 456-7890",
    email: "linda.chen@email.com",
    diagnosis: ["Hypertension", "Coronary Artery Disease"],
    riskLevel: "stable" as const,
    targetSystolic: 120,
    targetDiastolic: 80,
    medications: [
      {
        name: "Carvedilol",
        dosage: "12.5mg",
        frequency: "Twice daily",
        startDate: "2023-11-01",
      },
    ],
    assignedClinicianId: "clinician-001",
    createdAt: new Date("2024-11-01").toISOString(),
    updatedAt: now.toISOString(),
    lastContact: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    status: "active" as const,
  },
];

// Helper to generate readings for a patient
function generateReadings(patientId: string, days: number, riskLevel: string) {
  const readings: any[] = [];
  
  // Base values depending on risk level
  let baseSystolic = 125;
  let baseDiastolic = 78;
  let variance = 10;
  
  if (riskLevel === "critical") {
    baseSystolic = 165;
    baseDiastolic = 105;
    variance = 15;
  } else if (riskLevel === "high") {
    baseSystolic = 145;
    baseDiastolic = 92;
    variance = 12;
  } else if (riskLevel === "moderate") {
    baseSystolic = 135;
    baseDiastolic = 85;
    variance = 10;
  } else if (riskLevel === "stable") {
    baseSystolic = 120;
    baseDiastolic = 78;
    variance = 8;
  }
  
  for (let d = 0; d < days; d++) {
    // 1-2 readings per day
    const readingsPerDay = Math.random() > 0.3 ? 2 : 1;
    
    for (let r = 0; r < readingsPerDay; r++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(r === 0 ? 8 : 20); // Morning and evening
      date.setMinutes(Math.floor(Math.random() * 60));
      
      const systolic = Math.round(baseSystolic + (Math.random() * variance * 2 - variance));
      const diastolic = Math.round(baseDiastolic + (Math.random() * (variance * 0.7) - (variance * 0.35)));
      
      let status: "normal" | "elevated" | "high" | "critical" = "normal";
      if (systolic >= 180 || diastolic >= 120) status = "critical";
      else if (systolic >= 140 || diastolic >= 90) status = "high";
      else if (systolic >= 130 || diastolic >= 80) status = "elevated";
      
      readings.push({
        patientId,
        systolic,
        diastolic,
        pulse: Math.round(60 + Math.random() * 30),
        timestamp: date.toISOString(),
        source: "patient-app" as const,
        status,
        ...(Math.random() > 0.8 && {
          patientNote: [
            "Felt a bit dizzy",
            "After morning walk",
            "Before breakfast",
            "After medication",
            "Feeling good today",
          ][Math.floor(Math.random() * 5)],
        }),
      });
    }
  }
  
  return readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Sample notes
const notes = [
  {
    patientId: "P-2025-001",
    clinicianId: "clinician-001",
    clinicianName: "Dr. Sarah Chen",
    content: "Patient reports good medication adherence. BP trending in the right direction over past 2 weeks. Continue current regimen.",
    noteType: "follow-up" as const,
    createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientId: "P-2025-001",
    clinicianId: "clinician-001",
    clinicianName: "Dr. Sarah Chen",
    content: "Increased Lisinopril from 5mg to 10mg due to consistently elevated readings. Follow up in 2 weeks.",
    noteType: "medication-change" as const,
    createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientId: "P-2025-002",
    clinicianId: "clinician-001",
    clinicianName: "Dr. Sarah Chen",
    content: "Patient doing well on current medication. Encouraged continued lifestyle modifications including diet and exercise.",
    noteType: "general" as const,
    createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientId: "P-2025-003",
    clinicianId: "clinician-001",
    clinicianName: "Dr. Sarah Chen",
    content: "Critical BP reading this morning. Called patient - reports feeling fine, no symptoms. Will monitor closely. Consider medication adjustment if pattern continues.",
    noteType: "alert-response" as const,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientId: "P-2025-004",
    clinicianId: "clinician-001",
    clinicianName: "Dr. Sarah Chen",
    content: "Excellent progress. BP well controlled on current regimen. Patient engaged and motivated. Schedule follow-up in 3 months.",
    noteType: "care-plan" as const,
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Main seeding function
async function seedData() {
  console.log("🌱 Starting data seeding...\n");
  
  try {
    // 1. Add patients
    console.log("📋 Adding patients...");
    for (const patient of patients) {
      await db.collection("patients").doc(patient.id).set(patient);
      console.log(`  ✓ Added patient: ${patient.firstName} ${patient.lastName} (${patient.id})`);
    }
    console.log(`\n✅ Added ${patients.length} patients\n`);
    
    // 2. Add readings
    console.log("📊 Generating and adding blood pressure readings...");
    let totalReadings = 0;
    
    for (const patient of patients) {
      const readings = generateReadings(patient.id, 30, patient.riskLevel);
      
      for (const reading of readings) {
        await db.collection("readings").add(reading);
      }
      
      console.log(`  ✓ Added ${readings.length} readings for ${patient.firstName} ${patient.lastName}`);
      totalReadings += readings.length;
    }
    console.log(`\n✅ Added ${totalReadings} total readings\n`);
    
    // 3. Add notes
    console.log("📝 Adding clinician notes...");
    for (const note of notes) {
      await db.collection("clinicianNotes").add(note);
      const patient = patients.find(p => p.id === note.patientId);
      console.log(`  ✓ Added note for ${patient?.firstName} ${patient?.lastName}`);
    }
    console.log(`\n✅ Added ${notes.length} clinician notes\n`);
    
    // 4. Add sample alerts
    console.log("🚨 Adding sample alerts...");
    
    // Create a critical alert for James Wilson
    const criticalAlert = {
      patientId: "P-2025-003",
      patientName: "James Wilson",
      type: "critical-bp" as const,
      severity: "critical" as const,
      status: "new" as const,
      title: "Critical Blood Pressure Alert",
      description: "Blood pressure reading of 185/115 mmHg requires immediate attention.",
      triggerValue: "185/115",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    };
    await db.collection("alerts").add(criticalAlert);
    console.log("  ✓ Added critical alert for James Wilson");
    
    // Create a high BP alert for Robert Anderson
    const highAlert = {
      patientId: "P-2025-001",
      patientName: "Robert Anderson",
      type: "high-bp" as const,
      severity: "warning" as const,
      status: "acknowledged" as const,
      title: "High Blood Pressure Alert",
      description: "Blood pressure reading of 148/92 mmHg detected.",
      triggerValue: "148/92",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      acknowledgedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000).toISOString(),
    };
    await db.collection("alerts").add(highAlert);
    console.log("  ✓ Added high BP alert for Robert Anderson");
    
    // Create a resolved alert
    const resolvedAlert = {
      patientId: "P-2025-002",
      patientName: "Maria Garcia",
      type: "high-bp" as const,
      severity: "warning" as const,
      status: "resolved" as const,
      title: "High Blood Pressure Alert",
      description: "Blood pressure reading of 142/88 mmHg detected.",
      triggerValue: "142/88",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledgedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedBy: "clinician-001",
      resolution: "Patient contacted. Readings normalized after medication timing adjustment.",
    };
    await db.collection("alerts").add(resolvedAlert);
    console.log("  ✓ Added resolved alert for Maria Garcia");
    
    console.log("\n✅ Added 3 sample alerts\n");
    
    console.log("🎉 Data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • ${patients.length} patients`);
    console.log(`   • ${totalReadings} blood pressure readings`);
    console.log(`   • ${notes.length} clinician notes`);
    console.log(`   • 3 alerts`);
    console.log("\n✨ Your Firestore database is now populated with sample data!");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the seeding
seedData()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
