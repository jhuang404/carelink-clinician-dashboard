/**
 * API CLIENT
 * 
 * Centralized API client for frontend components.
 * Provides typed methods for all API endpoints.
 */

import type {
  PatientProfile,
  BPReading,
  ClinicianNote,
  GetPatientsResponse,
  GetPatientResponse,
  GetReadingsResponse,
  CreateReadingRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
} from "@/types/api";

const API_BASE = "/api";

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ PATIENTS API ============

export const patientsAPI = {
  /**
   * Get all patients
   */
  getAll: async (params?: {
    status?: string;
    riskLevel?: string;
    search?: string;
  }): Promise<GetPatientsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return fetchAPI(`/patients${query ? `?${query}` : ""}`);
  },

  /**
   * Get a single patient with readings and notes
   */
  getById: async (id: string): Promise<GetPatientResponse> => {
    return fetchAPI(`/patients/${id}`);
  },

  /**
   * Create a new patient
   */
  create: async (data: Partial<PatientProfile>): Promise<PatientProfile> => {
    return fetchAPI("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a patient
   */
  update: async (id: string, data: Partial<PatientProfile>): Promise<PatientProfile> => {
    return fetchAPI(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// ============ READINGS API ============

export const readingsAPI = {
  /**
   * Get readings for a patient
   */
  getByPatient: async (
    patientId: string,
    params?: { days?: number; limit?: number }
  ): Promise<GetReadingsResponse> => {
    const searchParams = new URLSearchParams({ patientId });
    if (params?.days) searchParams.set("days", String(params.days));
    if (params?.limit) searchParams.set("limit", String(params.limit));

    return fetchAPI(`/readings?${searchParams.toString()}`);
  },

  /**
   * Submit a new BP reading
   * This is the main endpoint that the iPad app will call
   */
  create: async (data: CreateReadingRequest): Promise<BPReading> => {
    return fetchAPI("/readings", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============ NOTES API ============

export const notesAPI = {
  /**
   * Get notes for a patient
   */
  getByPatient: async (
    patientId: string,
    limit?: number
  ): Promise<{ notes: ClinicianNote[]; total: number }> => {
    const params = new URLSearchParams({ patientId });
    if (limit) params.set("limit", String(limit));

    return fetchAPI(`/notes?${params.toString()}`);
  },

  /**
   * Create a new note
   */
  create: async (data: CreateNoteRequest): Promise<ClinicianNote> => {
    return fetchAPI("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a note
   */
  update: async (id: string, data: UpdateNoteRequest): Promise<ClinicianNote> => {
    return fetchAPI(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a note
   */
  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchAPI(`/notes/${id}`, {
      method: "DELETE",
    });
  },
};

// ============ EXPORT ALL ============

export const api = {
  patients: patientsAPI,
  readings: readingsAPI,
  notes: notesAPI,
};

export default api;
