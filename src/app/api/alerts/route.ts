/**
 * API ROUTE: /api/alerts
 * 
 * GET  - Retrieve all alerts (with real patient names from patients collection)
 * PATCH - Update alert status
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { Alert } from "@/types/api";

/**
 * GET /api/alerts
 * 
 * Fetches alerts and cross-references patientId with the patients collection
 * to ensure patientName is always up-to-date.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    if (!isAdminConfigured) {
      return NextResponse.json({ alerts: [], total: 0 });
    }

    // Fetch alerts and patients in parallel
    const [alertsSnap, patientsSnap] = await Promise.all([
      getCollection("alerts").get(),
      getCollection("patients").get(),
    ]);

    // Build patientId → real name lookup
    const patientNames: Record<string, string> = {};
    patientsSnap.forEach((doc) => {
      const d = doc.data();
      patientNames[doc.id] = `${d.firstName} ${d.lastName}`;
    });

    let alerts: Alert[] = [];
    alertsSnap.forEach((doc) => {
      const data = doc.data();
      const realName = patientNames[data.patientId];
      alerts.push({
        id: doc.id,
        ...data,
        patientName: realName || data.patientName || `Patient ${data.patientId}`,
      } as Alert);
    });

    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }

    alerts = alerts.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ alerts, total: alerts.length });

  } catch (error) {
    console.error("[API] Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/alerts
 * Update alert status
 */
export async function PATCH(request: NextRequest) {
  try {
    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Firebase not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { alertId, status, resolution } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: "alertId and status are required" },
        { status: 400 }
      );
    }

    const alertsRef = getCollection("alerts");
    const alertDoc = alertsRef.doc(alertId);

    const updateData: Record<string, string> = { status };

    if (status === "acknowledged") {
      updateData.acknowledgedAt = new Date().toISOString();
    } else if (status === "resolved") {
      updateData.resolvedAt = new Date().toISOString();
      updateData.resolvedBy = "clinician-001";
      if (resolution) {
        updateData.resolution = resolution;
      }
    }

    await alertDoc.update(updateData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API] Error updating alert:", error);
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    );
  }
}
