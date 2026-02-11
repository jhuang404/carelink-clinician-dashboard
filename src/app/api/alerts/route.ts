/**
 * API ROUTE: /api/alerts
 * 
 * Handles alert operations for clinicians.
 * 
 * GET  - Retrieve all alerts
 * PATCH - Update alert status
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { Alert } from "@/types/api";

/**
 * GET /api/alerts
 * 
 * Query params:
 * - status: filter by status (new, acknowledged, resolved)
 * - severity: filter by severity (critical, warning, info)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");

    // If Firebase is not configured, return empty array
    if (!isAdminConfigured) {
      console.log("[API] Firebase not configured, returning empty alerts");
      return NextResponse.json({ alerts: [], total: 0 });
    }

    // Firebase is configured - fetch from Firestore
    const alertsRef = getCollection("alerts");
    let query = alertsRef.orderBy("createdAt", "desc");

    // Apply filters
    if (status) {
      query = query.where("status", "==", status);
    }
    if (severity) {
      query = query.where("severity", "==", severity);
    }

    const snapshot = await query.get();
    const alerts: Alert[] = [];

    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as Alert);
    });

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
 * 
 * Update alert status
 * 
 * Body:
 * - alertId: string
 * - status: "new" | "acknowledged" | "resolved"
 * - resolution?: string (required for resolved status)
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

    const updateData: any = { status };
    
    if (status === "acknowledged") {
      updateData.acknowledgedAt = new Date().toISOString();
    } else if (status === "resolved") {
      updateData.resolvedAt = new Date().toISOString();
      updateData.resolvedBy = "clinician-001"; // TODO: Get from auth context
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
