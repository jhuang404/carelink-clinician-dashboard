import type { PatientSummary, PatientPriority } from "@/types";

/**
 * Demo Patient Dataset
 * 
 * This dataset represents clinical archetypes for MVP demonstration.
 * Each patient represents a meaningful clinical scenario:
 * 
 * CRITICAL (2):
 *   - Maria Rodriguez: Stage 2 HTN, very low adherence, needs immediate intervention
 *   - Robert Thompson: Elderly, dangerously high BP, rising trend
 * 
 * MODERATE (3):
 *   - James Wilson: Rising trend, moderate adherence, needs monitoring adjustment
 *   - Linda Martinez: Post-medication change, stabilizing
 *   - David Kim: New patient, still titrating medications
 * 
 * FOLLOW-UP (2):
 *   - Sarah Johnson: Due for scheduled follow-up
 *   - William Brown: Recent hospitalization, needs check-in
 * 
 * STABLE (3):
 *   - Michael Chen: Well-controlled, high adherence - success case
 *   - Emily Davis: Young patient, lifestyle-managed
 *   - Thomas Anderson: Long-term stable, routine monitoring
 * 
 * EDGE CASE (1):
 *   - Patricia Lee: Missing recent readings - data gap scenario
 */

export const demoPatients: PatientSummary[] = [
  // === CRITICAL PATIENTS ===
  {
    id: "P-2025-001",
    name: "Maria Rodriguez",
    priority: "Critical",
    bp: "185/110",
    bpTime: "2 hours ago",
    trend: "up",
    adherence: 32,
    lastContact: "5 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    age: 58,
    condition: "Hypertension Stage 2",
    notes: "Missed last 3 appointments. Language barrier - Spanish preferred.",
  },
  {
    id: "P-2025-002",
    name: "Robert Thompson",
    priority: "Critical",
    bp: "192/118",
    bpTime: "4 hours ago",
    trend: "up",
    adherence: 45,
    lastContact: "2 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    age: 72,
    condition: "Hypertension Stage 2 + CKD",
    notes: "Comorbid chronic kidney disease. Monitor closely.",
  },

  // === MODERATE PATIENTS ===
  {
    id: "P-2025-003",
    name: "James Wilson",
    priority: "Moderate",
    bp: "158/95",
    bpTime: "6 hours ago",
    trend: "up",
    adherence: 68,
    lastContact: "1 day ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    age: 54,
    condition: "Hypertension Stage 1",
    notes: "BP trending up after holiday travel. Review diet.",
  },
  {
    id: "P-2025-004",
    name: "Linda Martinez",
    priority: "Moderate",
    bp: "148/92",
    bpTime: "8 hours ago",
    trend: "down",
    adherence: 78,
    lastContact: "3 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    age: 61,
    condition: "Hypertension Stage 1",
    notes: "Switched from Lisinopril to Losartan 2 weeks ago. Monitoring response.",
  },
  {
    id: "P-2025-005",
    name: "David Kim",
    priority: "Moderate",
    bp: "152/94",
    bpTime: "12 hours ago",
    trend: "stable",
    adherence: 85,
    lastContact: "Today",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    age: 47,
    condition: "Hypertension Stage 1",
    notes: "New patient. Still titrating Amlodipine dose.",
  },

  // === FOLLOW-UP PATIENTS ===
  {
    id: "P-2025-006",
    name: "Sarah Johnson",
    priority: "Follow-up",
    bp: "138/88",
    bpTime: "1 day ago",
    trend: "stable",
    adherence: 82,
    lastContact: "2 weeks ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJ",
    age: 49,
    condition: "Hypertension Stage 1",
    notes: "Quarterly follow-up due. Good progress.",
  },
  {
    id: "P-2025-007",
    name: "William Brown",
    priority: "Follow-up",
    bp: "142/86",
    bpTime: "18 hours ago",
    trend: "down",
    adherence: 75,
    lastContact: "1 week ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=William",
    age: 67,
    condition: "Hypertension Stage 1",
    notes: "Discharged from hospital 10 days ago (hypertensive crisis). Close monitoring.",
  },

  // === STABLE PATIENTS ===
  {
    id: "P-2025-008",
    name: "Michael Chen",
    priority: "Stable",
    bp: "124/78",
    bpTime: "6 hours ago",
    trend: "stable",
    adherence: 94,
    lastContact: "Today",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    age: 52,
    condition: "Hypertension - Controlled",
    notes: "Excellent adherence. Role model patient for peer support program.",
  },
  {
    id: "P-2025-009",
    name: "Emily Davis",
    priority: "Stable",
    bp: "128/82",
    bpTime: "10 hours ago",
    trend: "stable",
    adherence: 88,
    lastContact: "3 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    age: 38,
    condition: "Hypertension - Lifestyle Managed",
    notes: "Managing with diet and exercise. Low-dose medication only.",
  },
  {
    id: "P-2025-010",
    name: "Thomas Anderson",
    priority: "Stable",
    bp: "132/84",
    bpTime: "14 hours ago",
    trend: "stable",
    adherence: 91,
    lastContact: "5 days ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
    age: 63,
    condition: "Hypertension - Controlled",
    notes: "On stable regimen for 3 years. Routine monitoring only.",
  },

  // === EDGE CASE: Missing Data ===
  {
    id: "P-2025-011",
    name: "Patricia Lee",
    priority: "Follow-up",
    bp: "—/—",
    bpTime: "5 days ago",
    trend: "stable",
    adherence: 60,
    lastContact: "1 week ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia",
    age: 55,
    condition: "Hypertension Stage 1",
    missedReadings: 5,
    notes: "No readings in 5 days. Device connectivity issue reported.",
  },
];

/**
 * Helper: Get patients by priority
 */
export const getPatientsByPriority = (priority: PatientPriority): PatientSummary[] => {
  return demoPatients.filter(p => p.priority === priority);
};

/**
 * Helper: Calculate summary stats from demo data
 */
export const getDemoStats = () => {
  const critical = demoPatients.filter(p => p.priority === "Critical").length;
  const moderate = demoPatients.filter(p => p.priority === "Moderate").length;
  const followUp = demoPatients.filter(p => p.priority === "Follow-up").length;
  const stable = demoPatients.filter(p => p.priority === "Stable").length;
  const total = demoPatients.length;

  return { critical, moderate, followUp, stable, total };
};

/**
 * Helper: Search patients by name or ID
 */
export const searchPatients = (query: string): PatientSummary[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return demoPatients;
  
  return demoPatients.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.id.toLowerCase().includes(lowerQuery) ||
    p.condition.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Helper: Sort patients by priority (urgency)
 */
export const sortByUrgency = (patients: PatientSummary[]): PatientSummary[] => {
  const priorityOrder: Record<PatientPriority, number> = {
    "Critical": 0,
    "Moderate": 1,
    "Follow-up": 2,
    "Stable": 3,
  };
  
  return [...patients].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
