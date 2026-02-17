/**
 * API ROUTE: /api/blood-pressure
 * 
 * Alias endpoint for iOS patient app compatibility.
 * This endpoint accepts blood pressure readings and forwards them to the main readings endpoint.
 * 
 * POST - Submit a new BP reading (called by iOS patient app)
 * 
 * Body:
 * - patientId: string (required)
 * - systolic: number (required)
 * - diastolic: number (required)
 * - pulse?: number (optional, heart rate)
 * - source?: string (default: "patient-app")
 * - deviceId?: string (optional, device identifier)
 * - patientNote?: string (optional, patient notes)
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { BPReading, CreateReadingRequest } from "@/types/api";

/**
 * POST /api/blood-pressure
 * 
 * Submit a new blood pressure reading from iOS patient app.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReadingRequest = await request.json();

    // Validate required fields
    if (!body.patientId || body.systolic == null || body.diastolic == null) {
      return NextResponse.json(
        { error: "patientId, systolic, and diastolic are required" },
        { status: 400 }
      );
    }

    // Validate BP ranges (basic sanity check)
    if (body.systolic < 60 || body.systolic > 300) {
      return NextResponse.json(
        { error: "Invalid systolic value (must be 60-300)" },
        { status: 400 }
      );
    }
    if (body.diastolic < 40 || body.diastolic > 200) {
      return NextResponse.json(
        { error: "Invalid diastolic value (must be 40-200)" },
        { status: 400 }
      );
    }

    // Calculate status based on BP values
    const status = getReadingStatus(body.systolic, body.diastolic);

    const readingData: Omit<BPReading, "id"> = {
      patientId: body.patientId,
      systolic: body.systolic,
      diastolic: body.diastolic,
      pulse: body.pulse,
      timestamp: new Date().toISOString(),
      source: body.source || "patient-app",
      deviceId: body.deviceId,
      status,
      patientNote: body.patientNote,
    };

    // If Firebase is not configured, return success with mock ID
    if (!isAdminConfigured) {
      const mockReading: BPReading = {
        id: `reading-${Date.now()}`,
        ...readingData,
      };

      console.log("[API /blood-pressure] Demo mode - reading would be saved:", mockReading);

      // Check if we should trigger an alert
      if (status === "critical" || status === "high") {
        console.log("[API /blood-pressure] Alert would be triggered for high BP reading");
      }

      return NextResponse.json(
        { success: true, reading: mockReading },
        { status: 201 }
      );
    }

    // Firebase is configured - save to Firestore
    const readingsRef = getCollection("readings");
    const docRef = await readingsRef.add(readingData);

    const savedReading: BPReading = {
      id: docRef.id,
      ...readingData,
    };

    console.log("[API /blood-pressure] Reading saved:", savedReading.id);

    // If critical or high, create an alert
    if (status === "critical" || status === "high") {
      await createAlertForReading(savedReading);
    }

    return NextResponse.json(
      { success: true, reading: savedReading },
      { status: 201 }
    );

  } catch (error) {
    console.error("[API /blood-pressure] Error creating reading:", error);
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper functions

function getReadingStatus(systolic: number, diastolic: number): BPReading["status"] {
  if (systolic >= 180 || diastolic >= 120) return "critical";
  if (systolic >= 140 || diastolic >= 90) return "high";
  if (systolic >= 130 || diastolic >= 80) return "elevated";
  return "normal";
}

async function createAlertForReading(reading: BPReading) {
  try {
    const alertsRef = getCollection("alerts");
    
    // Get patient name - try Firebase first, then fallback to demo data
    const patientsRef = getCollection("patients");
    const patientDoc = await patientsRef.doc(reading.patientId).get();
    const patientData = patientDoc.data();
    
    let patientName = "Unknown Patient";
    if (patientData) {
      patientName = `${patientData.firstName} ${patientData.lastName}`;
    } else {
      // Fallback to demo patient data
      const demoPatientMap: Record<string, string> = {
        "P-2025-001": "Maria Rodriguez",
        "P-2025-002": "Robert Thompson",
        "P-2025-003": "James Wilson",
        "P-2025-004": "Linda Martinez",
        "P-2025-005": "David Kim",
        "P-2025-006": "Sarah Johnson",
        "P-2025-007": "William Brown",
        "P-2025-008": "Michael Chen",
        "P-2025-009": "Emily Davis",
        "P-2025-010": "Thomas Anderson",
        "P-2025-011": "Patricia Lee",
      };
      patientName = demoPatientMap[reading.patientId] || "Unknown Patient";
    }

    const alertData = {
      patientId: reading.patientId,
      patientName,
      type: reading.status === "critical" ? "critical-bp" : "high-bp",
      severity: reading.status === "critical" ? "critical" : "warning",
      status: "new",
      title: reading.status === "critical" 
        ? "Critical Blood Pressure Alert"
        : "High Blood Pressure Alert",
      description: `Blood pressure reading of ${reading.systolic}/${reading.diastolic} mmHg requires attention.`,
      relatedReadingId: reading.id,
      triggerValue: `${reading.systolic}/${reading.diastolic}`,
      createdAt: new Date().toISOString(),
    };

    await alertsRef.add(alertData);
    console.log("[API /blood-pressure] Alert created for reading:", reading.id);

  } catch (error) {
    console.error("[API /blood-pressure] Failed to create alert:", error);
    // Don't throw - alert creation is not critical
  }
}
