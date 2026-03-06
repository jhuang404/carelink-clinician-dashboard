"use client";

import { useState } from "react";
import { Save, CheckCircle2, UserPlus } from "lucide-react";
import { Drawer, DrawerFooter } from "@/components/ui/Drawer";
import { cn } from "@/lib/utils";

interface AddPatientDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PatientForm {
  deviceId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  diagnosis: string;
  riskLevel: string;
  targetSystolic: number;
  targetDiastolic: number;
}

const emptyForm: PatientForm = {
  deviceId: "",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "other",
  phone: "",
  email: "",
  diagnosis: "Hypertension Stage 1",
  riskLevel: "moderate",
  targetSystolic: 130,
  targetDiastolic: 80,
};

export function AddPatientDrawer({ open, onClose, onSuccess }: AddPatientDrawerProps) {
  const [form, setForm] = useState<PatientForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof PatientForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!form.dateOfBirth) {
      setError("Date of birth is required.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.deviceId.trim() || undefined,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          phone: form.phone.trim(),
          email: form.email.trim() || undefined,
          diagnosis: [form.diagnosis],
          riskLevel: form.riskLevel,
          targetSystolic: form.targetSystolic,
          targetDiastolic: form.targetDiastolic,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create patient");
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setForm({ ...emptyForm });
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ ...emptyForm });
    setError(null);
    setSaved(false);
    onClose();
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase";

  return (
    <Drawer open={open} onClose={handleClose} width={480}>
      {/* Header */}
      <div className="border-b px-6 py-5 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-magenta-100">
            <UserPlus size={20} className="text-magenta-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Add New Patient</h3>
            <p className="text-xs text-gray-500">Fill in the patient details below</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Device / Patient ID */}
        <div className="rounded-lg border border-magenta-200 bg-magenta-50 p-4">
          <label className={cn(labelClass, "text-magenta-600")}>Device ID (iPad Patient App)</label>
          <input
            type="text"
            value={form.deviceId}
            onChange={e => update("deviceId", e.target.value)}
            placeholder="e.g. P-2025-005"
            className={cn(inputClass, "border-magenta-200 focus:border-magenta-500 bg-white")}
          />
          <p className="mt-1.5 text-[11px] text-magenta-500">
            Enter the device ID from the iPad app to link BP readings automatically. Leave blank to auto-generate.
          </p>
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              value={form.firstName}
              onChange={e => update("firstName", e.target.value)}
              placeholder="e.g. Maria"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              value={form.lastName}
              onChange={e => update("lastName", e.target.value)}
              placeholder="e.g. Rodriguez"
              className={inputClass}
            />
          </div>
        </div>

        {/* DOB & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={e => update("dateOfBirth", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Gender</label>
            <select
              value={form.gender}
              onChange={e => update("gender", e.target.value)}
              className={cn(inputClass, "bg-white")}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              placeholder="(555) 123-4567"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              placeholder="patient@email.com"
              className={inputClass}
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Clinical Info */}
        <div>
          <label className={labelClass}>Primary Diagnosis</label>
          <select
            value={form.diagnosis}
            onChange={e => update("diagnosis", e.target.value)}
            className={cn(inputClass, "bg-white")}
          >
            <option>Hypertension Stage 1</option>
            <option>Hypertension Stage 2</option>
            <option>Hypertension - Controlled</option>
            <option>Hypertension - Lifestyle Managed</option>
            <option>Hypertension + CKD</option>
            <option>Hypertension + Diabetes</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Risk Level</label>
            <select
              value={form.riskLevel}
              onChange={e => update("riskLevel", e.target.value)}
              className={cn(inputClass, "bg-white")}
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
              <option value="stable">Stable</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>BP Target</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={form.targetSystolic}
                onChange={e => update("targetSystolic", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
              />
              <span className="text-gray-400">/</span>
              <input
                type="number"
                value={form.targetDiastolic}
                onChange={e => update("targetDiastolic", parseInt(e.target.value) || 0)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <DrawerFooter className="flex items-center justify-end gap-3">
        <button
          onClick={handleClose}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || saved}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white transition-colors",
            saved
              ? "bg-green-500"
              : "bg-magenta-600 hover:bg-magenta-700",
            saving && "opacity-70 cursor-not-allowed"
          )}
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Patient Added!
            </>
          ) : saving ? (
            "Adding..."
          ) : (
            <>
              <Save size={16} />
              Add Patient
            </>
          )}
        </button>
      </DrawerFooter>
    </Drawer>
  );
}
