/**
 * API ROUTE: /api/notes
 * 
 * Handles clinician notes operations.
 * 
 * GET  - Retrieve notes for a patient
 * POST - Create a new note
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { ClinicianNote, CreateNoteRequest } from "@/types/api";

// In-memory store for demo mode
let demoNotes: ClinicianNote[] = [];

/**
 * GET /api/notes
 * 
 * Query params:
 * - patientId: (required) patient ID
 * - limit: max number of notes (default: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    // If Firebase is not configured, return demo notes
    if (!isAdminConfigured) {
      const notes = demoNotes
        .filter(n => n.patientId === patientId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

      return NextResponse.json({ notes, total: notes.length });
    }

    // Firebase is configured - fetch from Firestore
    const notesRef = getCollection("clinicianNotes");
    const snapshot = await notesRef
      .where("patientId", "==", patientId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const notes: ClinicianNote[] = [];
    snapshot.forEach((doc) => {
      notes.push({ id: doc.id, ...doc.data() } as ClinicianNote);
    });

    return NextResponse.json({ notes, total: notes.length });

  } catch (error) {
    console.error("[API] Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notes
 * 
 * Create a new clinician note.
 * 
 * Body:
 * - patientId: string
 * - content: string
 * - noteType: "general" | "medication-change" | "follow-up" | "alert-response" | "care-plan"
 * - relatedReadingId?: string
 * - relatedAlertId?: string
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateNoteRequest = await request.json();

    // Validate required fields
    if (!body.patientId || !body.content) {
      return NextResponse.json(
        { error: "patientId and content are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const noteData: Omit<ClinicianNote, "id"> = {
      patientId: body.patientId,
      clinicianId: "clinician-001", // TODO: Get from auth context
      clinicianName: "Dr. Sarah Chen", // TODO: Get from auth context
      content: body.content,
      noteType: body.noteType || "general",
      relatedReadingId: body.relatedReadingId,
      relatedAlertId: body.relatedAlertId,
      createdAt: now,
      updatedAt: now,
    };

    // If Firebase is not configured, store in memory
    if (!isAdminConfigured) {
      const newNote: ClinicianNote = {
        id: `note-${Date.now()}`,
        ...noteData,
      };
      
      demoNotes.unshift(newNote);
      console.log("[API] Demo mode - note saved in memory:", newNote.id);

      return NextResponse.json(newNote, { status: 201 });
    }

    // Firebase is configured - save to Firestore
    const notesRef = getCollection("clinicianNotes");
    const docRef = await notesRef.add(noteData);

    const savedNote: ClinicianNote = {
      id: docRef.id,
      ...noteData,
    };

    return NextResponse.json(savedNote, { status: 201 });

  } catch (error) {
    console.error("[API] Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
