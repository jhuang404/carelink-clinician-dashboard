import { 
  ArrowLeft, 
  Copy, 
  Save, 
  Plus, 
  X, 
  Eye, 
  Send, 
  Printer, 
  History,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function TreatmentPlanEditor() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Treatment Plan Editor</h2>
            <p className="text-sm text-gray-500">Customize monitoring and treatment protocols</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Copy size={18} />
            Copy Plan
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-magenta-600 px-4 py-2 text-sm font-medium text-white hover:bg-magenta-700">
            <Save size={18} />
            Save Plan
          </button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" 
            alt="Maria Rodriguez" 
            className="h-12 w-12 rounded-full bg-gray-100"
          />
          <div>
            <h3 className="font-bold text-gray-900">Maria Rodriguez</h3>
            <p className="text-xs text-gray-500">ID: P-2025-001 • Age: 58 • Hypertension Stage 2</p>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Latest BP</p>
            <p className="text-lg font-bold text-red-600">185/110</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Risk Level</p>
            <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">High</span>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Adherence</p>
            <p className="text-lg font-bold text-orange-600">45%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medication Protocol */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Medication Protocol</h3>
              <button className="flex items-center gap-1 text-xs font-bold text-magenta-600 hover:text-magenta-700">
                <Plus size={14} /> Add Medication
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Lisinopril", type: "ACE Inhibitor", dose: "10mg", freq: "Once daily", time: "09:00 AM" },
                { name: "Amlodipine", type: "Calcium Channel Blocker", dose: "10mg", freq: "Once daily", time: "09:00 AM" },
              ].map((med, i) => (
                <div key={i} className="relative rounded-xl border border-magenta-100 bg-magenta-50/30 p-4">
                  <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={16} /></button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-magenta-600 text-white">
                      <Plus size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{med.name}</p>
                      <p className="text-[10px] text-gray-500">{med.type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Dosage</label>
                      <input type="text" defaultValue={med.dose} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Frequency</label>
                      <input type="text" defaultValue={med.freq} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Time</label>
                      <input type="text" defaultValue={med.time} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Special Instructions</label>
                    <textarea 
                      placeholder="Take with food, monitor for dry cough..."
                      className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none h-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Schedule */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-6">Monitoring Schedule</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Blood Pressure Readings</label>
                  <select className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:outline-none">
                    <option>Twice daily</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight Monitoring</label>
                  <select className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:outline-none">
                    <option>Daily</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Preferred Times</label>
                  <div className="flex gap-2">
                    <input type="text" defaultValue="08:00 AM" className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                    <input type="text" defaultValue="08:00 PM" className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Symptom Check-ins</label>
                  <select className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:outline-none">
                    <option>Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-4">Alert Thresholds</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Systolic High", value: 180 },
                  { label: "Systolic Low", value: 90 },
                  { label: "Diastolic High", value: 110 },
                  { label: "Diastolic Low", value: 60 },
                ].map((threshold) => (
                  <div key={threshold.label}>
                    <label className="text-[10px] text-gray-500">{threshold.label}</label>
                    <input type="text" defaultValue={threshold.value} className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lifestyle Recommendations */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-6">Lifestyle Recommendations</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Exercise Goal</label>
                <input type="text" defaultValue="30 min moderate activity, 5x/week" className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Sodium Limit (mg/day)</label>
                <input type="text" defaultValue="2300" className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Additional Notes</label>
              <textarea 
                placeholder="Patient-specific lifestyle recommendations, dietary restrictions, etc."
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none h-24"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Helpers */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Plan Templates</h3>
            <div className="space-y-2">
              {[
                "Hypertension Stage 1",
                "Hypertension Stage 2",
                "Resistant Hypertension",
                "Elderly Patient"
              ].map((template) => (
                <button key={template} className="flex w-full items-center justify-between rounded-lg border border-gray-100 p-3 text-left text-sm hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-700">{template}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Eye size={18} className="text-magenta-600" /> Preview Plan
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Send size={18} className="text-magenta-600" /> Send to Patient
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <Printer size={18} className="text-magenta-600" /> Print Plan
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-gray-100">
                <History size={18} className="text-magenta-600" /> View History
              </button>
            </div>
          </div>

          <div className="card border-magenta-100 bg-magenta-50/50">
            <h3 className="font-bold text-magenta-900 mb-4 text-sm">Clinical Guidelines</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-magenta-800 uppercase">AHA/ACC 2017 Guidelines</p>
                <p className="mt-1 text-xs text-magenta-700">Stage 2: ≥140/90 mmHg</p>
                <p className="text-xs text-magenta-700">Target: &lt;130/80 mmHg</p>
              </div>
              <div>
                <p className="text-xs font-bold text-magenta-800 uppercase">First-line Therapy</p>
                <p className="mt-1 text-xs text-magenta-700">ACE inhibitors, ARBs, CCBs, or thiazide diuretics.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
