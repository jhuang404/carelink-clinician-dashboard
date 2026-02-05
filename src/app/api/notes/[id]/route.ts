/**
 * API ROUTE: /api/notes/[id]
 * 
 * Handles individual note operations.
 * 
 * GET    - Retrieve a single note
 * PUT    - Update a note
 * DELETE - Delete a note
 */

import { NextRequest, NextResponse } from "next/server";
import { isAdminConfigured, getCollection } from "@/lib/firebase-admin";
import type { ClinicianNote, UpdateNoteRequest } from "@/types/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/notes/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Note not found (demo mode)" },
        { status: 404 }
      );
    }

    const notesRef = getCollection("clinicianNotes");
    const noteDoc = await notesRef.doc(id).get();

    if (!noteDoc.exists) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: noteDoc.id, ...noteDoc.data() });

  } catch (error) {
    console.error("[API] Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notes/[id]
 * 
 * Update a note's content or type.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: UpdateNoteRequest = await request.json();

    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Cannot update notes in demo mode without Firebase" },
        { status: 503 }
      );
    }

    const notesRef = getCollection("clinicianNotes");
    const noteDoc = await notesRef.doc(id).get();

    if (!noteDoc.exists) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    const updateData: Partial<ClinicianNote> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    if (body.noteType !== undefined) {
      updateData.noteType = body.noteType;
    }

    await notesRef.doc(id).update(updateData);

    const updatedNote = { id, ...noteDoc.data(), ...updateData };
    return NextResponse.json(updatedNote);

  } catch (error) {
    console.error("[API] Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notes/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!isAdminConfigured) {
      return NextResponse.json(
        { error: "Cannot delete notes in demo mode without Firebase" },
        { status: 503 }
      );
    }

    const notesRef = getCollection("clinicianNotes");
    const noteDoc = await notesRef.doc(id).get();

    if (!noteDoc.exists) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    await notesRef.doc(id).delete();

    return NextResponse.json({ success: true, deletedId: id });

  } catch (error) {
    console.error("[API] Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
