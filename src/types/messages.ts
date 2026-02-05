/**
 * MESSAGING TYPES
 * 
 * Clinical messaging for remote patient monitoring.
 * Each conversation is tied to a patient context.
 */

/**
 * Participant roles in a conversation
 */
export type ParticipantRole = "patient" | "caregiver" | "clinician";

/**
 * Participant in a conversation
 */
export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  avatar: string;
  relationship?: string; // e.g., "Family Member", "Spouse" for caregivers
}

/**
 * Individual message in a thread
 */
export interface Message {
  id: string;
  senderId: string;
  senderRole: ParticipantRole;
  content: string;
  timestamp: string; // ISO string or display string
  isRead: boolean;
}

/**
 * Patient context for a conversation
 */
export interface PatientContext {
  id: string;
  name: string;
  priority: "Critical" | "Moderate" | "Stable" | "Follow-up";
  avatar: string;
}

/**
 * Conversation thread
 */
export interface Conversation {
  id: string;
  patient: PatientContext;
  participant: Participant; // The non-clinician participant (patient or caregiver)
  messages: Message[];
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string;
}
