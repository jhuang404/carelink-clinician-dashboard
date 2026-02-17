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

    // If Firebase is not configured, return demo alerts
    if (!isAdminConfigured) {
      console.log("[API] Firebase not configured, returning demo alerts");
      const demoAlerts = generateDemoAlerts();
      return NextResponse.json({ alerts: demoAlerts, total: demoAlerts.length });
    }

    // Firebase is configured - fetch from Firestore
    const alertsRef = getCollection("alerts");
    // Simple query without orderBy to avoid index requirement
    const snapshot = await alertsRef.get();
    
    let alerts: Alert[] = [];

    snapshot.forEach((doc) => {
      alerts.push({ id: doc.id, ...doc.data() } as Alert);
    });

    // Apply filters in memory
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (severity) {
      alerts = alerts.filter(a => a.severity === severity);
    }
    
    // Sort by createdAt in memory
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

// Generate demo alerts for when Firebase is not configured
function generateDemoAlerts(): Alert[] {
  const now = new Date();
  
  return [
    {
      id: "demo-alert-1",
      patientId: "P-2025-001",
      patientName: "Maria Rodriguez",
      type: "critical-bp",
      severity: "critical",
      status: "new",
      title: "Severe Hypertension Alert",
      description: "Patient's blood pressure has exceeded critical threshold. Last medication taken 3 days ago. Immediate intervention required.",
      relatedReadingId: "reading-demo-1",
      triggerValue: "185/110",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: "demo-alert-2",
      patientId: "P-2025-002",
      patientName: "Robert Thompson",
      type: "critical-bp",
      severity: "critical",
      status: "new",
      title: "Critical BP Reading",
      description: "Elderly patient with comorbid CKD showing dangerously elevated BP. Risk of hypertensive crisis.",
      relatedReadingId: "reading-demo-2",
      triggerValue: "192/118",
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: "demo-alert-3",
      patientId: "P-2025-003",
      patientName: "James Wilson",
      type: "high-bp",
      severity: "warning",
      status: "acknowledged",
      title: "Elevated BP Trend",
      description: "Blood pressure showing consistent upward trend over past week. Patient reported stress from work.",
      relatedReadingId: "reading-demo-3",
      triggerValue: "165/95",
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      acknowledgedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    },
    {
      id: "demo-alert-4",
      patientId: "P-2025-004",
      patientName: "Linda Martinez",
      type: "follow-up-due",
      severity: "warning",
      status: "new",
      title: "Medication Adjustment Needed",
      description: "Recent medication change not showing expected results. Consider dose adjustment or alternative.",
      relatedReadingId: "reading-demo-4",
      triggerValue: "148/92",
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    },
    {
      id: "demo-alert-5",
      patientId: "P-2025-011",
      patientName: "Patricia Lee",
      type: "missed-reading",
      severity: "info",
      status: "new",
      title: "Missed Reading Alert",
      description: "Patient has not submitted BP readings for 5 days. Device connectivity issue reported.",
      triggerValue: "—/—",
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    },
  ];
}
