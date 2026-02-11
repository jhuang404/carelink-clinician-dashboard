/**
 * API DATA MODELS
 * 
 * TypeScript interfaces for Firebase Firestore documents.
 * These types are used across API routes and frontend components.
 */

// ============ PATIENT ============

export type RiskLevel = "critical" | "high" | "moderate" | "low" | "stable";
export type PatientStatus = "active" | "inactive" | "pending";

export interface PatientProfile {
  id: string;
  
  // Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: "male" | "female" | "other";
  
  // Contact
  phone: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Emergency Contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  
  // Clinical Info
  diagnosis: string[];
  riskLevel: RiskLevel;
  targetSystolic: number;  // e.g., 130
  targetDiastolic: number; // e.g., 80
  
  // Medications (simplified for MVP)
  medications?: MedicationItem[];
  
  // Assignment
  assignedClinicianId: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContact?: string; // Last interaction date (ISO string)
  status: PatientStatus;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
}

// ============ BLOOD PRESSURE READING ============

export type ReadingSource = "patient-app" | "manual" | "device-sync";
export type ReadingStatus = "normal" | "elevated" | "high" | "critical";

export interface BPReading {
  id: string;
  patientId: string;
  
  // Vitals
  systolic: number;
  diastolic: number;
  pulse?: number;
  
  // Metadata
  timestamp: string; // ISO datetime string
  source: ReadingSource;
  deviceId?: string;
  
  // Calculated status (based on thresholds)
  status: ReadingStatus;
  
  // Optional notes from patient
  patientNote?: string;
}

// Helper to calculate reading status
export const calculateReadingStatus = (systolic: number, diastolic: number): ReadingStatus => {
  if (systolic >= 180 || diastolic >= 120) return "critical";
  if (systolic >= 140 || diastolic >= 90) return "high";
  if (systolic >= 130 || diastolic >= 80) return "elevated";
  return "normal";
};

// ============ CLINICIAN NOTES ============

export type NoteType = "general" | "medication-change" | "follow-up" | "alert-response" | "care-plan";

export interface ClinicianNote {
  id: string;
  patientId: string;
  clinicianId: string;
  clinicianName: string;
  
  // Content
  content: string;
  noteType: NoteType;
  
  // Related entities (optional)
  relatedReadingId?: string;
  relatedAlertId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============ ALERTS ============

export type AlertType = "high-bp" | "critical-bp" | "missed-reading" | "low-adherence" | "follow-up-due";
export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "new" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  
  // Alert details
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  
  // Message
  title: string;
  description: string;
  
  // Related data
  relatedReadingId?: string;
  triggerValue?: string; // e.g., "185/110"
  
  // Timestamps
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  
  // Resolution
  resolvedBy?: string;
  resolution?: string;
}

// ============ API REQUEST/RESPONSE TYPES ============

// Patients
export interface GetPatientsResponse {
  patients: PatientProfile[];
  total: number;
}

export interface GetPatientResponse {
  patient: PatientProfile;
  recentReadings: BPReading[];
  notes: ClinicianNote[];
}

// Readings
export interface GetReadingsParams {
  patientId: string;
  days?: number; // default 30
  limit?: number;
}

export interface GetReadingsResponse {
  readings: BPReading[];
  stats: {
    avgSystolic: number;
    avgDiastolic: number;
    totalReadings: number;
    criticalCount: number;
  };
}

export interface CreateReadingRequest {
  patientId: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  source: ReadingSource;
  deviceId?: string;
  patientNote?: string;
}

// Notes
export interface CreateNoteRequest {
  patientId: string;
  content: string;
  noteType: NoteType;
  relatedReadingId?: string;
  relatedAlertId?: string;
}

export interface UpdateNoteRequest {
  content?: string;
  noteType?: NoteType;
}

// Alerts
export interface GetAlertsParams {
  status?: AlertStatus;
  severity?: AlertSeverity;
  patientId?: string;
}

export interface UpdateAlertRequest {
  status: AlertStatus;
  resolution?: string;
}

// ============ FIRESTORE COLLECTION NAMES ============

export const COLLECTIONS = {
  PATIENTS: "patients",
  READINGS: "readings",
  NOTES: "clinicianNotes",
  ALERTS: "alerts",
  CLINICIANS: "clinicians",
} as const;
