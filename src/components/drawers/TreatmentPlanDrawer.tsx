"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Plus, 
  Save, 
  Pill,
  Activity,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Drawer, DrawerFooter } from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";
import type { Patient, TreatmentPlan, Medication } from "@/types";

interface TreatmentPlanDrawerProps {
  open: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (plan: TreatmentPlan) => Promise<void>;
}

// Mock data - in production this would come from API
const getMockTreatmentPlan = (patientId: string): TreatmentPlan => ({
  patientId,
  medications: [
    { id: "1", name: "Lisinopril", type: "ACE Inhibitor", dose: "10mg", frequency: "Once daily", time: "09:00 AM", instructions: "Take with food" },
    { id: "2", name: "Amlodipine", type: "Calcium Channel Blocker", dose: "10mg", frequency: "Once daily", time: "09:00 AM", instructions: "" },
  ],
  monitoring: {
    bpReadings: "Twice daily",
    weightMonitoring: "Daily",
    preferredTimes: ["08:00 AM", "08:00 PM"],
    symptomCheckins: "Weekly",
  },
  alertThresholds: {
    systolicHigh: 180,
    systolicLow: 90,
    diastolicHigh: 110,
    diastolicLow: 60,
  },
  lifestyle: {
    exerciseGoal: "30 min moderate activity, 5x/week",
    sodiumLimit: 2300,
    additionalNotes: "",
  },
  updatedAt: new Date().toISOString(),
});

export function TreatmentPlanDrawer({ open, patient, onClose, onSave }: TreatmentPlanDrawerProps) {
  const [plan, setPlan] = useState<TreatmentPlan | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"medications" | "monitoring" | "lifestyle">("medications");

  // Load treatment plan when patient changes
  useEffect(() => {
    if (patient) {
      // In production: fetch from API
      const mockPlan = getMockTreatmentPlan(patient.id);
      setPlan(mockPlan);
      setSaved(false);
    }
  }, [patient?.id]);

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await onSave(plan);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    if (!plan) return;
    const updated = [...plan.medications];
    updated[index] = { ...updated[index], [field]: value };
    setPlan({ ...plan, medications: updated });
  };

  const removeMedication = (index: number) => {
    if (!plan) return;
    const updated = plan.medications.filter((_, i) => i !== index);
    setPlan({ ...plan, medications: updated });
  };

  const addMedication = () => {
    if (!plan) return;
    const newMed: Medication = {
      id: Date.now().toString(),
      name: "",
      type: "",
      dose: "",
      frequency: "Once daily",
      time: "09:00 AM",
      instructions: "",
    };
    setPlan({ ...plan, medications: [...plan.medications, newMed] });
  };

  if (!patient) return null;

  const tabs = [
    { id: "medications", label: "Medications", icon: Pill },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "lifestyle", label: "Lifestyle", icon: Heart },
  ] as const;

  return (
    <Drawer open={open} onClose={onClose} width={560}>
      {/* Patient Header */}
      <div className="border-b px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={patient.avatar} 
              alt={patient.name} 
              className="h-12 w-12 rounded-full bg-gray-200"
            />
            <div>
              <h3 className="font-bold text-gray-900">{patient.name}</h3>
              <p className="text-xs text-gray-500">ID: {patient.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Latest BP</p>
              <p className={cn(
                "text-lg font-bold",
                patient.priority === "Critical" ? "text-red-600" : 
                patient.priority === "Moderate" ? "text-orange-600" : "text-gray-900"
              )}>{patient.bp}</p>
            </div>
            <span className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold",
              patient.priority === "Critical" && "bg-red-100 text-red-700",
              patient.priority === "Moderate" && "bg-orange-100 text-orange-700",
              patient.priority === "Stable" && "bg-green-100 text-green-700",
              patient.priority === "Follow-up" && "bg-blue-100 text-blue-700"
            )}>
              {patient.priority}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id 
                  ? "border-magenta-600 text-magenta-600" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "medications" && plan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700">Current Medications</h4>
              <button 
                onClick={addMedication}
                className="flex items-center gap-1 text-xs font-bold text-magenta-600 hover:text-magenta-700"
              >
                <Plus size={14} /> Add Medication
              </button>
            </div>

            {plan.medications.map((med, index) => (
              <div key={med.id} className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <button 
                  onClick={() => removeMedication(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <X size={16} />
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Medication Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      placeholder="Enter medication name"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Dosage</label>
                    <input
                      type="text"
                      value={med.dose}
                      onChange={(e) => updateMedication(index, "dose", e.target.value)}
                      placeholder="e.g., 10mg"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Frequency</label>
                    <select
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none bg-white"
                    >
                      <option>Once daily</option>
                      <option>Twice daily</option>
                      <option>Three times daily</option>
                      <option>As needed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Instructions</label>
                    <input
                      type="text"
                      value={med.instructions || ""}
                      onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                      placeholder="e.g., Take with food"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {plan.medications.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                <Pill className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No medications added yet</p>
                <button 
                  onClick={addMedication}
                  className="mt-3 text-sm font-medium text-magenta-600 hover:text-magenta-700"
                >
                  Add first medication
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "monitoring" && plan && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-4">Monitoring Schedule</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">BP Readings</label>
                  <select
                    value={plan.monitoring.bpReadings}
                    onChange={(e) => setPlan({ ...plan, monitoring: { ...plan.monitoring, bpReadings: e.target.value }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none bg-white"
                  >
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight Check</label>
                  <select
                    value={plan.monitoring.weightMonitoring}
                    onChange={(e) => setPlan({ ...plan, monitoring: { ...plan.monitoring, weightMonitoring: e.target.value }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none bg-white"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-500" />
                Alert Thresholds
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Systolic High</label>
                  <input
                    type="number"
                    value={plan.alertThresholds.systolicHigh}
                    onChange={(e) => setPlan({ ...plan, alertThresholds: { ...plan.alertThresholds, systolicHigh: parseInt(e.target.value) }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Systolic Low</label>
                  <input
                    type="number"
                    value={plan.alertThresholds.systolicLow}
                    onChange={(e) => setPlan({ ...plan, alertThresholds: { ...plan.alertThresholds, systolicLow: parseInt(e.target.value) }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Diastolic High</label>
                  <input
                    type="number"
                    value={plan.alertThresholds.diastolicHigh}
                    onChange={(e) => setPlan({ ...plan, alertThresholds: { ...plan.alertThresholds, diastolicHigh: parseInt(e.target.value) }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Diastolic Low</label>
                  <input
                    type="number"
                    value={plan.alertThresholds.diastolicLow}
                    onChange={(e) => setPlan({ ...plan, alertThresholds: { ...plan.alertThresholds, diastolicLow: parseInt(e.target.value) }})}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "lifestyle" && plan && (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Exercise Goal</label>
              <input
                type="text"
                value={plan.lifestyle.exerciseGoal}
                onChange={(e) => setPlan({ ...plan, lifestyle: { ...plan.lifestyle, exerciseGoal: e.target.value }})}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Daily Sodium Limit (mg)</label>
              <input
                type="number"
                value={plan.lifestyle.sodiumLimit}
                onChange={(e) => setPlan({ ...plan, lifestyle: { ...plan.lifestyle, sodiumLimit: parseInt(e.target.value) }})}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Additional Notes</label>
              <textarea
                value={plan.lifestyle.additionalNotes}
                onChange={(e) => setPlan({ ...plan, lifestyle: { ...plan.lifestyle, additionalNotes: e.target.value }})}
                placeholder="Diet recommendations, restrictions, etc."
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <DrawerFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={14} />
          Last updated: {plan ? new Date(plan.updatedAt).toLocaleDateString() : "-"}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
              saved 
                ? "bg-green-500" 
                : "bg-magenta-600 hover:bg-magenta-700",
              saving && "opacity-70 cursor-not-allowed"
            )}
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} />
                Saved!
              </>
            ) : saving ? (
              "Saving..."
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </DrawerFooter>
    </Drawer>
  );
}
