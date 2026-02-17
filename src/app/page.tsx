"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Phone, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ClipboardEdit,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TreatmentPlanDrawer } from "@/components/drawers/TreatmentPlanDrawer";
import type { PatientSummary, TreatmentPlan } from "@/types";
import type { PatientProfile } from "@/types/api";

/**
 * PATIENT DASHBOARD - MVP Demo Version
 * 
 * This dashboard uses demo data (11 patients) representing clinical archetypes.
 * The data is NOT from real patients - it's synthetic for demonstration purposes.
 * 
 * INTERACTION MODEL:
 * 1. ROW CLICK → Navigate to Patient Details (/patients/:id)
 * 2. EDIT PLAN BUTTON → Open Drawer (no navigation, stopPropagation)
 * 3. SECONDARY ACTIONS → Direct actions with stopPropagation
 */

export default function Dashboard() {
  const router = useRouter();
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"urgency" | "name" | "adherence">("urgency");
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [patientReadings, setPatientReadings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch patients from API and set up auto-refresh
  useEffect(() => {
    fetchPatients();
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing patient data...');
      fetchPatients();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data.patients || []);
      
      // Fetch latest readings for each patient
      const readingsPromises = data.patients.map(async (patient: PatientProfile) => {
        try {
          const readingsRes = await fetch(`/api/readings?patientId=${patient.id}&limit=1`);
          if (readingsRes.ok) {
            const readingsData = await readingsRes.json();
            return { patientId: patient.id, readings: readingsData.readings };
          }
        } catch (err) {
          console.error(`Failed to fetch readings for ${patient.id}:`, err);
        }
        return { patientId: patient.id, readings: [] };
      });
      
      const allReadings = await Promise.all(readingsPromises);
      const readingsMap: Record<string, any> = {};
      allReadings.forEach(({ patientId, readings }) => {
        readingsMap[patientId] = readings[0] || null;
      });
      console.log('📊 Patient Readings Map:', readingsMap);
      console.log('📋 Patients with lastContact:', data.patients.map((p: any) => ({ 
        id: p.id, 
        name: `${p.firstName} ${p.lastName}`, 
        lastContact: p.lastContact 
      })));
      setPatientReadings(readingsMap);
      
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Convert PatientProfile to PatientSummary format for compatibility
  const patientSummaries: PatientSummary[] = useMemo(() => {
    console.log('🔄 Computing patient summaries. Patients:', patients.length, 'Readings:', Object.keys(patientReadings).length);
    return patients.map(p => {
      const latestReading = patientReadings[p.id];
      const lastContactDate = p.lastContact ? new Date(p.lastContact) : null;
      const now = new Date();
      
      console.log(`👤 ${p.firstName} ${p.lastName}:`, {
        lastContact: p.lastContact,
        latestReading: latestReading ? `${latestReading.systolic}/${latestReading.diastolic}` : 'none'
      });
      
      // Format last contact as relative time
      let lastContactStr = "No recent contact";
      if (lastContactDate) {
        const daysDiff = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) lastContactStr = "Today";
        else if (daysDiff === 1) lastContactStr = "Yesterday";
        else if (daysDiff < 7) lastContactStr = `${daysDiff} days ago`;
        else if (daysDiff < 30) lastContactStr = `${Math.floor(daysDiff / 7)} weeks ago`;
        else lastContactStr = `${Math.floor(daysDiff / 30)} months ago`;
      }
      
      // Format BP reading
      let bpStr = "—/—";
      let bpTimeStr = "No recent data";
      if (latestReading) {
        bpStr = `${latestReading.systolic}/${latestReading.diastolic}`;
        const readingDate = new Date(latestReading.timestamp);
        const hoursDiff = Math.floor((now.getTime() - readingDate.getTime()) / (1000 * 60 * 60));
        if (hoursDiff < 1) bpTimeStr = "Just now";
        else if (hoursDiff < 24) bpTimeStr = `${hoursDiff}h ago`;
        else bpTimeStr = `${Math.floor(hoursDiff / 24)}d ago`;
      }
      
      return {
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        age: new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear(),
        priority: mapRiskLevelToPriority(p.riskLevel),
        condition: p.diagnosis.join(', '),
        bp: bpStr,
        bpTime: bpTimeStr,
        trend: latestReading?.status === 'critical' || latestReading?.status === 'high' ? 'up' as const : 'stable' as const,
        adherence: 85, // TODO: Calculate from readings
        lastContact: lastContactStr,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
        missedReadings: 0,
      };
    });
  }, [patients, patientReadings]);

  // Calculate stats from real patient data
  const stats = useMemo(() => {
    const critical = patients.filter(p => p.riskLevel === 'critical').length;
    const high = patients.filter(p => p.riskLevel === 'high').length;
    const moderate = patients.filter(p => p.riskLevel === 'moderate').length;
    const low = patients.filter(p => p.riskLevel === 'low').length;
    const stable = patients.filter(p => p.riskLevel === 'stable').length;
    
    return {
      critical,
      moderate: moderate + high,
      followUp: low,
      stable,
      total: patients.length,
    };
  }, [patients]);

  // Filter and sort patients based on search and sort selection
  const filteredPatients = useMemo(() => {
    let result = [...patientSummaries];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.condition.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortBy === "urgency") {
      const priorityOrder = { "Critical": 0, "Moderate": 1, "Follow-up": 2, "Stable": 3 };
      result = result.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    } else if (sortBy === "name") {
      result = result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "adherence") {
      result = result.sort((a, b) => b.adherence - a.adherence);
    }
    
    return result;
  }, [patientSummaries, searchQuery, sortBy]);

  // Helper function to map risk level to priority
  function mapRiskLevelToPriority(riskLevel: string): "Critical" | "Moderate" | "Stable" | "Follow-up" {
    switch (riskLevel) {
      case "critical": return "Critical";
      case "high": return "Moderate";
      case "moderate": return "Moderate";
      case "low": return "Follow-up";
      case "stable": return "Stable";
      default: return "Stable";
    }
  }

  // Stats cards data derived from demo patients
  const statsCards = [
    { 
      label: "CRITICAL", 
      value: stats.critical, 
      sub: "Needs immediate attention", 
      color: "red", 
      badge: "Urgent" 
    },
    { 
      label: "MODERATE", 
      value: stats.moderate, 
      sub: "Requires monitoring", 
      color: "orange", 
      badge: "Watch" 
    },
    { 
      label: "FOLLOW-UP", 
      value: stats.followUp, 
      sub: "Scheduled checkups", 
      color: "blue", 
      badge: "Routine" 
    },
    { 
      label: "STABLE", 
      value: stats.stable, 
      sub: "Under control", 
      color: "green", 
      badge: "Good" 
    },
  ];

  /**
   * ROW CLICK HANDLER
   * Navigates to Patient Details page for deep-dive review.
   */
  const handleRowClick = (patient: PatientSummary) => {
    router.push(`/patients/${patient.id}`);
  };

  /**
   * EDIT PLAN HANDLER
   * Opens drawer for quick treatment plan editing WITHOUT leaving the list.
   */
  const openTreatmentPlan = (e: React.MouseEvent, patient: PatientSummary) => {
    e.stopPropagation(); // CRITICAL: Prevent row navigation
    setSelectedPatient(patient);
    setDrawerOpen(true);
  };

  /**
   * SECONDARY ACTION HANDLER
   */
  const handleSecondaryAction = (e: React.MouseEvent, action: string, patient: PatientSummary) => {
    e.stopPropagation();
    console.log(`${action} action for patient:`, patient.name);
    // TODO: Implement action handlers
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedPatient(null), 300);
  };

  const handleSavePlan = async (plan: TreatmentPlan) => {
    // TODO: In production, save to API
    console.log("Saving treatment plan:", plan);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  return (
    <div className={cn(
      "space-y-8 transition-all duration-300",
      drawerOpen && "mr-[560px]"
    )}>
      {/* Firebase Connection Banner */}
      {!loading && !error && patients.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-2">
          <AlertCircle size={16} className="text-green-600" />
          <p className="text-sm text-green-800">
            <span className="font-medium">Connected:</span> Displaying real patient data from Firebase Firestore.
          </p>
        </div>
      )}
      
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2">
          <AlertCircle size={16} className="text-red-600" />
          <p className="text-sm text-red-800">
            <span className="font-medium">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
          <p className="text-gray-500">Manage and monitor all your patients in one place</p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border bg-white p-1">
            <button className="rounded-md bg-gray-100 px-4 py-1.5 text-sm font-medium">
              All Patients ({patients.length})
            </button>
          </div>
          <button className="btn-primary gap-2">
            <Plus size={18} />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Grid - derived from demo data */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <div key={stat.label} className="card flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 tracking-wider">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                stat.color === 'red' ? 'bg-red-50 text-red-600' :
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                'bg-green-50 text-green-600'
              }`}>
                {stat.badge}
              </span>
            </div>
            <p className="mt-4 text-xs text-gray-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters - functional search and sort */}
      <div className="card flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-1 items-center gap-4 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients by name, ID, or condition..." 
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-magenta-500 focus:outline-none"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "urgency" | "name" | "adherence")}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:border-magenta-500 focus:outline-none"
          >
            <option value="urgency">Sort by Urgency</option>
            <option value="name">Sort by Name</option>
            <option value="adherence">Sort by Adherence</option>
          </select>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} className="text-magenta-600" />
          Export
        </button>
      </div>

      {/* Patient List */}
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Patient List</h3>
            <p className="text-sm text-gray-500">Real-time monitoring and management</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            <button 
              onClick={fetchPatients}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Latest BP</th>
                <th className="px-6 py-4">Trend</th>
                <th className="px-6 py-4">Adherence</th>
                <th className="px-6 py-4">Last Contact</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-magenta-600" />
                      <p className="text-gray-500">Loading patients...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <p className="text-red-500">Error loading patients: {error}</p>
                    <button 
                      onClick={fetchPatients}
                      className="mt-2 text-sm text-magenta-600 hover:text-magenta-700"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    {searchQuery ? (
                      <>
                        <p className="text-gray-500">No patients found matching "{searchQuery}"</p>
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-sm text-magenta-600 hover:text-magenta-700"
                        >
                          Clear search
                        </button>
                      </>
                    ) : (
                      <p className="text-gray-500">No patients found. Add your first patient to get started.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id}
                    onClick={() => handleRowClick(patient)}
                    className={cn(
                      "hover:bg-gray-50 transition-colors cursor-pointer",
                      selectedPatient?.id === patient.id && "bg-magenta-50"
                    )}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        patient.priority === "Critical" && "bg-red-100 text-red-800",
                        patient.priority === "Moderate" && "bg-orange-100 text-orange-800",
                        patient.priority === "Stable" && "bg-green-100 text-green-800",
                        patient.priority === "Follow-up" && "bg-blue-100 text-blue-800"
                      )}>
                        {patient.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={patient.avatar} alt={patient.name} className="h-10 w-10 rounded-full bg-gray-100" />
                        <div>
                          <p className="text-sm font-bold text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">ID: {patient.id} • {patient.age}y</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={cn(
                        "text-sm font-bold",
                        patient.bp === "—/—" ? "text-gray-400" :
                        patient.priority === "Critical" ? "text-red-600" : 
                        patient.priority === "Moderate" ? "text-orange-600" : "text-gray-900"
                      )}>
                        {patient.bp}
                        {patient.missedReadings && patient.missedReadings > 0 && (
                          <span className="ml-1 text-xs text-amber-600" title={`${patient.missedReadings} missed readings`}>
                            ⚠
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{patient.bpTime}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "flex h-8 w-12 items-center justify-center rounded-lg",
                        patient.trend === "up" ? "bg-red-50 text-red-600" : 
                        patient.trend === "down" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"
                      )}>
                        {patient.trend === "up" ? <TrendingUp size={18} /> : 
                         patient.trend === "down" ? <TrendingDown size={18} /> : <Minus size={18} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              patient.adherence < 50 ? "bg-red-500" : 
                              patient.adherence < 80 ? "bg-orange-500" : "bg-green-500"
                            )} 
                            style={{ width: `${patient.adherence}%` }} 
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{patient.adherence}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{patient.lastContact}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* PRIMARY ACTION: Edit Treatment Plan */}
                        <button
                          onClick={(e) => openTreatmentPlan(e, patient)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            selectedPatient?.id === patient.id
                              ? "bg-magenta-600 text-white"
                              : "bg-magenta-50 text-magenta-700 hover:bg-magenta-100"
                          )}
                        >
                          <ClipboardEdit size={14} />
                          Edit Plan
                        </button>
                        
                        {/* SECONDARY ACTIONS: Communication only (row click handles navigation) */}
                        <button 
                          onClick={(e) => handleSecondaryAction(e, "message", patient)}
                          className="p-1.5 text-gray-400 hover:text-magenta-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Send message to patient"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={(e) => handleSecondaryAction(e, "call", patient)}
                          className="p-1.5 text-gray-400 hover:text-magenta-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Call patient"
                        >
                          <Phone size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-6">
          <p className="text-sm text-gray-500">
            Showing {filteredPatients.length} of {stats.total} patients
          </p>
        </div>
      </div>

      {/* Treatment Plan Drawer */}
      <TreatmentPlanDrawer
        open={drawerOpen}
        patient={selectedPatient}
        onClose={closeDrawer}
        onSave={handleSavePlan}
      />
    </div>
  );
}
