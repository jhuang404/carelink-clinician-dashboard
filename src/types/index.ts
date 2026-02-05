/**
 * Patient priority levels for triage
 */
export type PatientPriority = "Critical" | "Moderate" | "Stable" | "Follow-up";

/**
 * Blood pressure trend direction
 */
export type BPTrend = "up" | "down" | "stable";

/**
 * PatientSummary - used in dashboard patient list
 * Represents the key clinical data points for triage decisions
 */
export interface PatientSummary {
  id: string;
  name: string;
  priority: PatientPriority;
  bp: string;                    // Latest BP reading (e.g., "185/110")
  bpTime: string;                // How long ago (e.g., "2 hours ago")
  trend: BPTrend;                // BP trend direction
  adherence: number;             // Medication adherence percentage (0-100)
  lastContact: string;           // Last clinician contact (e.g., "3 days ago")
  avatar: string;                // Avatar URL
  age: number;                   // Patient age
  condition: string;             // Primary condition (e.g., "Hypertension Stage 2")
  missedReadings?: number;       // Optional: consecutive missed readings
  notes?: string;                // Optional: clinical notes/flags
}

/**
 * @deprecated Use PatientSummary instead
 * Kept for backward compatibility during migration
 */
export interface Patient {
  id: string;
  name: string;
  priority: PatientPriority;
  bp: string;
  bpTime: string;
  trend: BPTrend;
  adherence: number;
  lastContact: string;
  avatar: string;
  age?: number;
  condition?: string;
}

export interface Medication {
  id: string;
  name: string;
  type: string;
  dose: string;
  frequency: string;
  time: string;
  instructions?: string;
}

export interface AlertThresholds {
  systolicHigh: number;
  systolicLow: number;
  diastolicHigh: number;
  diastolicLow: number;
}

export interface MonitoringSchedule {
  bpReadings: string;
  weightMonitoring: string;
  preferredTimes: string[];
  symptomCheckins: string;
}

export interface LifestyleRecommendations {
  exerciseGoal: string;
  sodiumLimit: number;
  additionalNotes: string;
}

export interface TreatmentPlan {
  patientId: string;
  medications: Medication[];
  monitoring: MonitoringSchedule;
  alertThresholds: AlertThresholds;
  lifestyle: LifestyleRecommendations;
  updatedAt: string;
}
