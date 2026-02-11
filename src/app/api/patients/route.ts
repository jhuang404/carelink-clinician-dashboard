/**
 * API ROUTE: /api/patients
 * 
 * Handles patient list operations.
 * 
 * GET  - Retrieve all patients for the clinician
 * POST - Create a new patient (optional for MVP)
 */

import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { PatientProfile, GetPatientsResponse, COLLECTIONS } from "@/types/api";

// Demo data for when Firebase is not configured
import { demoPatients } from "@/data/demoPatients";

/**
 * GET /api/patients
 * 
 * Query params:
 * - status: filter by patient status (active, inactive)
 * - riskLevel: filter by risk level (critical, high, moderate, low, stable)
 * - search: search by name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const riskLevel = searchParams.get("riskLevel");
    const search = searchParams.get("search")?.toLowerCase();

    // If Firebase is not configured, return demo data
    if (!isAdminConfigured) {
      console.log("[API] Firebase not configured, returning demo data");
      
      let patients = demoPatients.map(p => ({
        id: p.id,
        firstName: p.name.split(" ")[0],
        lastName: p.name.split(" ").slice(1).join(" ") || "",
        dateOfBirth: "1960-01-01", // placeholder
        gender: "other" as const,
        phone: "(555) 000-0000",
        diagnosis: [p.condition],
        riskLevel: mapPriorityToRiskLevel(p.priority),
        targetSystolic: 130,
        targetDiastolic: 80,
        assignedClinicianId: "clinician-001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active" as const,
      }));

      // Apply filters
      if (search) {
        patients = patients.filter(p => 
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
        );
      }

      if (riskLevel) {
        patients = patients.filter(p => p.riskLevel === riskLevel);
      }

      const response: GetPatientsResponse = {
        patients,
        total: patients.length,
      };

      return NextResponse.json(response);
    }

    // Firebase is configured - fetch from Firestore
    const patientsRef = getCollection("patients");
    // Simple query without orderBy to avoid index requirement
    const snapshot = await patientsRef.get();
    
    let patients: PatientProfile[] = [];

    snapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() } as PatientProfile);
    });

    // Apply filters in memory
    if (status) {
      patients = patients.filter(p => p.status === status);
    }
    if (riskLevel) {
      patients = patients.filter(p => p.riskLevel === riskLevel);
    }
    
    // Apply search filter
    if (search) {
      patients = patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      );
    }
    
    // Sort by updatedAt in memory
    patients = patients.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const response: GetPatientsResponse = {
      patients,
      total: patients.length,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[API] Error fetching patients:", error);
    return NextResponse.json(
      { error: "Failed to fetch patients" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * 
 * Create a new patient record
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Firebase not configured. Cannot create patients in demo mode." },
        { status: 503 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["firstName", "lastName", "dateOfBirth", "phone"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();
    const patientData: Omit<PatientProfile, "id"> = {
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender || "other",
      phone: body.phone,
      email: body.email,
      address: body.address,
      emergencyContact: body.emergencyContact,
      diagnosis: body.diagnosis || [],
      riskLevel: body.riskLevel || "moderate",
      targetSystolic: body.targetSystolic || 130,
      targetDiastolic: body.targetDiastolic || 80,
      medications: body.medications || [],
      assignedClinicianId: body.assignedClinicianId || "clinician-001",
      createdAt: now,
      updatedAt: now,
      status: "active",
    };

    const patientsRef = getCollection("patients");
    const docRef = await patientsRef.add(patientData);

    return NextResponse.json(
      { id: docRef.id, ...patientData },
      { status: 201 }
    );

  } catch (error) {
    console.error("[API] Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient" },
      { status: 500 }
    );
  }
}

// Helper to map demo data priority to risk level
function mapPriorityToRiskLevel(priority: string): PatientProfile["riskLevel"] {
  switch (priority) {
    case "Critical": return "critical";
    case "Moderate": return "moderate";
    case "Stable": return "stable";
    case "Follow-up": return "low";
    default: return "moderate";
  }
}
