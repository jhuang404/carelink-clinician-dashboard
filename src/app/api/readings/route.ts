/**
 * API ROUTE: /api/readings
 * 
 * Handles blood pressure reading operations.
 * This is the main endpoint that the iPad patient app will call.
 * 
 * GET  - Retrieve readings for a patient
 * POST - Submit a new BP reading (called by iPad app)
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { 
  BPReading, 
  CreateReadingRequest, 
  GetReadingsResponse,
  DailyBPAverage,
  calculateReadingStatus 
} from "@/types/api";

/**
 * GET /api/readings
 * 
 * Query params:
 * - patientId: (required) patient ID
 * - days: number of days to fetch (default: 30)
 * - limit: max number of readings (default: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const days = parseInt(searchParams.get("days") || "30");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    // If Firebase is not configured, return mock data
    if (!isAdminConfigured) {
      const mockReadings = generateMockReadings(patientId, days, limit);
      const stats = calculateStats(mockReadings);
      const dailyAverages = calculateDailyAverages(mockReadings);

      const response: GetReadingsResponse = {
        readings: mockReadings,
        dailyAverages,
        stats,
      };

      return NextResponse.json(response);
    }

    // Firebase is configured - fetch from Firestore
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const readingsRef = getCollection("readings");
    const snapshot = await readingsRef
      .where("patientId", "==", patientId)
      .get();

    let readings: BPReading[] = [];
    snapshot.forEach((doc) => {
      readings.push({ id: doc.id, ...doc.data() } as BPReading);
    });

    // Filter by date and sort in memory
    readings = readings
      .filter(r => new Date(r.timestamp) >= startDate)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    const stats = calculateStats(readings);
    const dailyAverages = calculateDailyAverages(readings);

    const response: GetReadingsResponse = {
      readings,
      dailyAverages,
      stats,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("[API] Error fetching readings:", error);
    return NextResponse.json(
      { error: "Failed to fetch readings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/readings
 * 
 * Submit a new blood pressure reading.
 * Called by the iPad patient app after each measurement.
 * 
 * Body:
 * - patientId: string
 * - systolic: number
 * - diastolic: number
 * - pulse?: number
 * - source: "patient-app" | "manual" | "device-sync"
 * - deviceId?: string
 * - patientNote?: string
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateReadingRequest = await request.json();

    // Validate required fields
    if (!body.patientId || !body.systolic || !body.diastolic) {
      return NextResponse.json(
        { error: "patientId, systolic, and diastolic are required" },
        { status: 400 }
      );
    }

    // Validate BP ranges (basic sanity check)
    if (body.systolic < 60 || body.systolic > 300) {
      return NextResponse.json(
        { error: "Invalid systolic value" },
        { status: 400 }
      );
    }
    if (body.diastolic < 40 || body.diastolic > 200) {
      return NextResponse.json(
        { error: "Invalid diastolic value" },
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

      console.log("[API] Demo mode - reading would be saved:", mockReading);

      // Check if we should trigger an alert
      if (status === "critical" || status === "high") {
        console.log("[API] Alert would be triggered for high BP reading");
      }

      return NextResponse.json(mockReading, { status: 201 });
    }

    // Firebase is configured - save to Firestore
    const readingsRef = getCollection("readings");
    const docRef = await readingsRef.add(readingData);

    const savedReading: BPReading = {
      id: docRef.id,
      ...readingData,
    };

    // If critical or high, create an alert
    if (status === "critical" || status === "high") {
      await createAlertForReading(savedReading);
    }

    return NextResponse.json(savedReading, { status: 201 });

  } catch (error) {
    console.error("[API] Error creating reading:", error);
    return NextResponse.json(
      { error: "Failed to create reading" },
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

function calculateStats(readings: BPReading[]): GetReadingsResponse["stats"] {
  if (readings.length === 0) {
    return {
      avgSystolic: 0,
      avgDiastolic: 0,
      totalReadings: 0,
      criticalCount: 0,
      readingsPerDay: 0,
    };
  }

  const totalSystolic = readings.reduce((sum, r) => sum + r.systolic, 0);
  const totalDiastolic = readings.reduce((sum, r) => sum + r.diastolic, 0);
  const criticalCount = readings.filter(r => r.status === "critical" || r.status === "high").length;

  const uniqueDays = new Set(readings.map(r => r.timestamp.slice(0, 10))).size;
  const readingsPerDay = uniqueDays > 0 ? Math.round((readings.length / uniqueDays) * 10) / 10 : 0;

  return {
    avgSystolic: Math.round(totalSystolic / readings.length),
    avgDiastolic: Math.round(totalDiastolic / readings.length),
    totalReadings: readings.length,
    criticalCount,
    readingsPerDay,
  };
}

function calculateDailyAverages(readings: BPReading[]): DailyBPAverage[] {
  const grouped: Record<string, BPReading[]> = {};

  for (const r of readings) {
    const dateKey = r.timestamp.slice(0, 10); // YYYY-MM-DD
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(r);
  }

  return Object.entries(grouped)
    .map(([date, dayReadings]) => {
      const systolics = dayReadings.map(r => r.systolic);
      const diastolics = dayReadings.map(r => r.diastolic);
      const pulses = dayReadings.filter(r => r.pulse != null).map(r => r.pulse!);

      const avgSys = Math.round(systolics.reduce((a, b) => a + b, 0) / systolics.length);
      const avgDia = Math.round(diastolics.reduce((a, b) => a + b, 0) / diastolics.length);

      return {
        date,
        avgSystolic: avgSys,
        avgDiastolic: avgDia,
        avgPulse: pulses.length > 0 ? Math.round(pulses.reduce((a, b) => a + b, 0) / pulses.length) : undefined,
        minSystolic: Math.min(...systolics),
        maxSystolic: Math.max(...systolics),
        minDiastolic: Math.min(...diastolics),
        maxDiastolic: Math.max(...diastolics),
        readingCount: dayReadings.length,
        status: getReadingStatus(avgSys, avgDia),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

function generateMockReadings(patientId: string, days: number, limit: number): BPReading[] {
  const readings: BPReading[] = [];
  const now = new Date();
  const readingTimes = [7, 10, 13, 17, 21]; // 5 readings per day

  for (let d = 0; d < days && readings.length < limit; d++) {
    const dayVariance = Math.sin(d * 0.3) * 8;

    for (let r = 0; r < readingTimes.length && readings.length < limit; r++) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(readingTimes[r] + Math.floor(Math.random() * 2));
      date.setMinutes(Math.floor(Math.random() * 60));
      date.setSeconds(Math.floor(Math.random() * 60));

      const baseSystolic = 130 + Math.floor(Math.random() * 30);
      const baseDiastolic = 78 + Math.floor(Math.random() * 18);

      const systolic = Math.round(baseSystolic + dayVariance + (Math.random() - 0.5) * 12);
      const diastolic = Math.round(baseDiastolic + dayVariance * 0.6 + (Math.random() - 0.5) * 8);

      const status = getReadingStatus(systolic, diastolic);

      readings.push({
        id: `mock-reading-${patientId}-${d}-${r}`,
        patientId,
        systolic,
        diastolic,
        pulse: 62 + Math.floor(Math.random() * 25),
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
    console.log("[API] Alert created for reading:", reading.id);

  } catch (error) {
    console.error("[API] Failed to create alert:", error);
    // Don't throw - alert creation is not critical
  }
}
