/**
 * API ROUTE: /api/patients/[id]
 * 
 * Handles individual patient operations.
 * 
 * GET  - Retrieve patient details with recent readings and notes
 * PUT  - Update patient information
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { PatientProfile, BPReading, ClinicianNote, GetPatientResponse } from "@/types/api";

// Demo data for when Firebase is not configured
import { demoPatients } from "@/data/demoPatients";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/patients/[id]
 * 
 * Returns patient profile with recent readings and notes
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // If Firebase is not configured, return demo data
    if (!isAdminConfigured) {
      const demoPatient = demoPatients.find(p => p.id === id);
      
      if (!demoPatient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      // Generate mock readings for demo
      const mockReadings: BPReading[] = generateMockReadings(id, 30);
      
      const response: GetPatientResponse = {
        patient: {
          id: demoPatient.id,
          firstName: demoPatient.name.split(" ")[0],
          lastName: demoPatient.name.split(" ").slice(1).join(" ") || "",
          dateOfBirth: "1960-01-01",
          gender: "other",
          phone: "(555) 000-0000",
          diagnosis: [demoPatient.condition],
          riskLevel: mapPriorityToRiskLevel(demoPatient.priority),
          targetSystolic: 130,
          targetDiastolic: 80,
          assignedClinicianId: "clinician-001",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "active",
        },
        recentReadings: mockReadings,
        notes: [],
      };

      return NextResponse.json(response);
    }

    // Firebase is configured - fetch from Firestore
    const patientsRef = getCollection("patients");
    const patientDoc = await patientsRef.doc(id).get();

    if (!patientDoc.exists) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    const patient = { id: patientDoc.id, ...patientDoc.data() } as PatientProfile;

    // Fetch recent readings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const readingsRef = getCollection("readings");
    const readingsSnapshot = await readingsRef
      .where("patientId", "==", id)
      .where("timestamp", ">=", thirtyDaysAgo.toISOString())
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    const readings: BPReading[] = [];
    readingsSnapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() } as BPReading);
    });

    // Fetch notes
    const notesRef = getCollection("clinicianNotes");
    const notesSnapshot = await notesRef
      .where("patientId", "==", id)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const notes: ClinicianNote[] = [];
    notesSnapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() } as ClinicianNote);
    });

    const response: GetPatientResponse = {
      patient,
      recentReadings: readings,
      notes,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[API] Error fetching patient:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/[id]
 * 
 * Update patient information
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Firebase not configured. Cannot update patients in demo mode." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const patientsRef = getCollection("patients");
    const patientDoc = await patientsRef.doc(id).get();

    if (!patientDoc.exists) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Update only provided fields
    const updateData: Partial<PatientProfile> = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Remove id from update data if present
    delete updateData.id;

    await patientsRef.doc(id).update(updateData);

    return NextResponse.json({ id, ...updateData });

  } catch (error) {
    console.error("[API] Error updating patient:", error);
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    );
  }
}

// Helper functions

function mapPriorityToRiskLevel(priority: string): PatientProfile["riskLevel"] {
  switch (priority) {
    case "Critical": return "critical";
    case "Moderate": return "moderate";
    case "Stable": return "stable";
    case "Follow-up": return "low";
    default: return "moderate";
  }
}

function generateMockReadings(patientId: string, days: number): BPReading[] {
  const readings: BPReading[] = [];
  const now = new Date();
  
  // Generate 2-3 readings per day for the specified number of days
  for (let d = 0; d < days; d++) {
    const readingsPerDay = Math.floor(Math.random() * 2) + 1;
    
    for (let r = 0; r < readingsPerDay; r++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(8 + (r * 8) + Math.floor(Math.random() * 4));
      date.setMinutes(Math.floor(Math.random() * 60));
      
      // Generate realistic BP values with some variation
      const baseSystolic = 130 + Math.floor(Math.random() * 40);
      const baseDiastolic = 80 + Math.floor(Math.random() * 20);
      
      const systolic = baseSystolic + Math.floor(Math.random() * 20) - 10;
      const diastolic = baseDiastolic + Math.floor(Math.random() * 10) - 5;
      
      let status: BPReading["status"] = "normal";
      if (systolic >= 180 || diastolic >= 120) status = "critical";
      else if (systolic >= 140 || diastolic >= 90) status = "high";
      else if (systolic >= 130 || diastolic >= 80) status = "elevated";
      
      readings.push({
        id: `reading-${patientId}-${d}-${r}`,
        patientId,
        systolic,
        diastolic,
        pulse: 60 + Math.floor(Math.random() * 30),
        timestamp: date.toISOString(),
        source: "patient-app",
        status,
      });
    }
  }
  
  return readings.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
