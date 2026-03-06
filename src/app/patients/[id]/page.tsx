"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Pill,
  Calendar,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Bell,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils";
import { TreatmentPlanDrawer } from "@/components/drawers/TreatmentPlanDrawer";
import type { Patient, TreatmentPlan } from "@/types";

/**
 * PATIENT DETAILS PAGE
 * 
 * Deep-dive view for individual patient review with real BP chart visualization.
 */

// Helper functions
const mapRiskLevelToPriority = (riskLevel: string): "Critical" | "Moderate" | "Stable" | "Follow-up" => {
  if (riskLevel === 'high') return 'Critical';
  if (riskLevel === 'medium') return 'Moderate';
  if (riskLevel === 'low') return 'Stable';
  return 'Follow-up';
};

const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (hoursDiff < 1) return "Just now";
  if (hoursDiff < 24) return `${hoursDiff}h ago`;
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 7) return `${daysDiff} day${daysDiff > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

// Mock BP chart data - 30 days of readings
const generateBPData = (patientId: string) => {
  const baseSystemic = patientId === "P-2025-001" ? 170 : patientId === "P-2025-002" ? 155 : 125;
  const baseDiastolic = patientId === "P-2025-001" ? 100 : patientId === "P-2025-002" ? 92 : 80;
  const variance = patientId === "P-2025-001" ? 20 : 15;
  
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      systolic: Math.round(baseSystemic + (Math.random() - 0.3) * variance),
      diastolic: Math.round(baseDiastolic + (Math.random() - 0.3) * (variance * 0.6)),
    });
  }
  return data;
};

// Fallback patient data when API is unavailable
const getPatientById = (id: string) => ({
  id,
  name: `Patient ${id}`,
  priority: "Moderate" as const,
  bp: "—/—",
  bpTime: "No data",
  trend: "stable" as "up" | "down" | "stable",
  adherence: 0,
  lastContact: "Unknown",
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
  age: 0,
  gender: "Unknown",
  condition: "Loading...",
  riskLevel: "Medium",
  medications: [] as { name: string; dose: string; type: string; adherence: number }[],
  readings: [] as { date: string; time: string; systolic: number; diastolic: number; status: string }[],
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-magenta-600">
          Systolic: {payload[0]?.value} mmHg
        </p>
        <p className="text-sm font-bold text-blue-500">
          Diastolic: {payload[1]?.value} mmHg
        </p>
      </div>
    );
  }
  return null;
};

const DailyAvgTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[180px]">
        <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
        <div className="space-y-1.5">
          <div>
            <p className="text-sm font-bold text-magenta-600">
              Avg Systolic: {data?.avgSystolic} mmHg
            </p>
            {data?.minSystolic != null && (
              <p className="text-[11px] text-gray-400">
                Range: {data.minSystolic} – {data.maxSystolic}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-blue-500">
              Avg Diastolic: {data?.avgDiastolic} mmHg
            </p>
            {data?.minDiastolic != null && (
              <p className="text-[11px] text-gray-400">
                Range: {data.minDiastolic} – {data.maxDiastolic}
              </p>
            )}
          </div>
          {data?.readingCount && (
            <p className="text-[11px] text-gray-400 pt-1 border-t">
              {data.readingCount} readings
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default function PatientDetails() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [chartView, setChartView] = useState<"daily-avg" | "individual">("daily-avg");
  const [bpReadings, setBpReadings] = useState<any[]>([]);
  const [dailyAverages, setDailyAverages] = useState<any[]>([]);
  const [readingsStats, setReadingsStats] = useState<any>(null);
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Reminder modal
  const [reminderOpen, setReminderOpen] = useState(false);
  const [reminderMethod, setReminderMethod] = useState<"email" | "sms">("email");
  const [reminderTo, setReminderTo] = useState("");
  const [reminderMsg, setReminderMsg] = useState("Hi, this is a reminder from your care team to please take your blood pressure reading today. Thank you!");
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  
  // Fetch patient data and readings from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch patient profile
        const patientRes = await fetch(`/api/patients/${patientId}`);
        if (patientRes.ok) {
          const patientJson = await patientRes.json();
          setPatientData(patientJson.patient || patientJson);
        }
        
        // Fetch BP readings (increased limit for 5 readings/day)
        const days = timeRange === "7" ? 7 : timeRange === "90" ? 90 : 30;
        const readingsRes = await fetch(`/api/readings?patientId=${patientId}&days=${days}&limit=500`);
        if (readingsRes.ok) {
          const readingsJson = await readingsRes.json();
          setBpReadings(readingsJson.readings || []);
          setDailyAverages(readingsJson.dailyAverages || []);
          setReadingsStats(readingsJson.stats || null);
        }
        
      } catch (error) {
        console.error('Error fetching patient data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 60000); // 1 minute
    
    return () => clearInterval(refreshInterval);
  }, [patientId, timeRange]);


  const handleSendReminder = async () => {
    setReminderSending(true);
    try {
      const to = reminderTo;
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          patientName: patientData ? `${patientData.firstName} ${patientData.lastName}` : patientId,
          message: reminderMsg,
          method: reminderMethod,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to send reminder");
        setReminderSending(false);
        return;
      }
      setReminderSending(false);
      setReminderSent(true);
      setTimeout(() => {
        setReminderSent(false);
        setReminderOpen(false);
      }, 2500);
    } catch {
      alert("Failed to send reminder");
      setReminderSending(false);
    }
  };

  const handleExportPDF = useCallback(async () => {
    setExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      const pName = patientData
        ? `${patientData.firstName} ${patientData.lastName}`
        : `Patient ${patientId}`;

      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(226, 0, 116);
      pdf.text("CareLink Doctor", margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(120, 120, 120);
      pdf.text(`Blood Pressure Report  •  Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, y);
      y += 6;
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin, y, pageW - margin, y);
      y += 8;

      // Patient info
      pdf.setFontSize(16);
      pdf.setTextColor(30, 30, 30);
      pdf.text(pName, margin, y);
      y += 6;
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`ID: ${patientId}  •  DOB: ${patientData?.dateOfBirth || "N/A"}  •  Gender: ${patientData?.gender || "N/A"}`, margin, y);
      y += 5;
      pdf.text(`Diagnosis: ${patientData?.diagnosis?.join(", ") || "Hypertension"}`, margin, y);
      y += 10;

      // Stats summary
      const stats = readingsStats;
      const avgSys = stats?.avgSystolic || 0;
      const avgDia = stats?.avgDiastolic || 0;
      const total = stats?.totalReadings || bpReadings.length;
      const perDay = stats?.readingsPerDay || 0;

      pdf.setFillColor(248, 248, 248);
      pdf.roundedRect(margin, y, pageW - margin * 2, 18, 3, 3, "F");
      pdf.setFontSize(11);
      pdf.setTextColor(30, 30, 30);
      const col = (pageW - margin * 2) / 4;
      pdf.text(`${avgSys}/${avgDia}`, margin + col * 0 + 4, y + 7);
      pdf.text(`${total}`, margin + col * 1 + 4, y + 7);
      pdf.text(`${dailyAverages.length}`, margin + col * 2 + 4, y + 7);
      pdf.text(`${perDay}`, margin + col * 3 + 4, y + 7);
      pdf.setFontSize(7);
      pdf.setTextColor(140, 140, 140);
      pdf.text("Overall Average", margin + col * 0 + 4, y + 13);
      pdf.text("Total Readings", margin + col * 1 + 4, y + 13);
      pdf.text("Days Tracked", margin + col * 2 + 4, y + 13);
      pdf.text("Avg Readings/Day", margin + col * 3 + 4, y + 13);
      y += 24;

      // Chart screenshot
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png");
        const imgW = pageW - margin * 2;
        const imgH = (canvas.height / canvas.width) * imgW;
        if (y + imgH > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.addImage(imgData, "PNG", margin, y, imgW, imgH);
        y += imgH + 8;
      }

      // Daily averages table
      if (dailyAverages.length > 0) {
        if (y + 20 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
        pdf.setFontSize(12);
        pdf.setTextColor(30, 30, 30);
        pdf.text("Daily BP Averages", margin, y);
        y += 6;

        // Table header
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        const cols = [margin, margin + 30, margin + 58, margin + 86, margin + 114, margin + 140];
        pdf.text("DATE", cols[0], y);
        pdf.text("AVG BP", cols[1], y);
        pdf.text("SYS RANGE", cols[2], y);
        pdf.text("DIA RANGE", cols[3], y);
        pdf.text("READINGS", cols[4], y);
        pdf.text("STATUS", cols[5], y);
        y += 2;
        pdf.setDrawColor(230, 230, 230);
        pdf.line(margin, y, pageW - margin, y);
        y += 4;

        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);
        dailyAverages.slice(0, 14).forEach((da: any) => {
          if (y + 6 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
          const dateStr = new Date(da.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
          pdf.text(dateStr, cols[0], y);
          pdf.text(`${da.avgSystolic}/${da.avgDiastolic}`, cols[1], y);
          pdf.text(`${da.minSystolic}-${da.maxSystolic}`, cols[2], y);
          pdf.text(`${da.minDiastolic}-${da.maxDiastolic}`, cols[3], y);
          pdf.text(`${da.readingCount}/5`, cols[4], y);
          const status = da.status === "critical" ? "Critical" : da.status === "high" ? "High" : da.status === "elevated" ? "Elevated" : "Normal";
          pdf.text(status, cols[5], y);
          y += 5;
        });
      }

      // Medications
      if (patientData?.medications?.length > 0) {
        y += 6;
        if (y + 20 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
        pdf.setFontSize(12);
        pdf.setTextColor(30, 30, 30);
        pdf.text("Current Medications", margin, y);
        y += 6;
        pdf.setFontSize(9);
        pdf.setTextColor(50, 50, 50);
        patientData.medications.forEach((med: any) => {
          if (y + 5 > pdf.internal.pageSize.getHeight() - margin) { pdf.addPage(); y = margin; }
          pdf.text(`• ${med.name} ${med.dosage || ""} — ${med.class || ""} (${med.frequency || "Daily"})`, margin + 2, y);
          y += 5;
        });
      }

      // Footer
      y = pdf.internal.pageSize.getHeight() - 10;
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text("CareLink Doctor — Confidential Patient Report. For clinical use only.", margin, y);
      pdf.text(`Dr. Sarah Chen • Cardiology`, pageW - margin - 40, y);

      pdf.save(`BP-Report-${pName.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Failed to generate PDF report");
    } finally {
      setExporting(false);
    }
  }, [patientId, patientData, readingsStats, dailyAverages, bpReadings]);

  // Convert API patient data to component format
  const latestReading = bpReadings[0];
  const bpTrend = (
    latestReading?.status === 'critical' || latestReading?.status === 'high' ? 'up' : 'stable'
  ) as "up" | "down" | "stable";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let patient: any;
  if (patientData) {
    patient = {
      id: patientData.id,
      name: `${patientData.firstName} ${patientData.lastName}`,
      age: new Date().getFullYear() - new Date(patientData.dateOfBirth).getFullYear(),
      gender: patientData.gender || "Unknown",
      condition: patientData.diagnosis?.join(', ') || "Hypertension",
      priority: mapRiskLevelToPriority(patientData.riskLevel),
      bp: latestReading ? `${latestReading.systolic}/${latestReading.diastolic}` : "—/—",
      bpTime: latestReading ? formatRelativeTime(latestReading.timestamp) : "No data",
      trend: bpTrend,
      adherence: 85,
      lastContact: patientData.lastContact ? formatRelativeTime(patientData.lastContact) : "No contact",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${patientData.id}`,
      riskLevel: patientData.riskLevel === 'high' ? 'High' : patientData.riskLevel === 'medium' ? 'Medium' : 'Low',
      medications: patientData.medications?.map((med: any) => ({
        name: med.name,
        dose: med.dosage,
        type: med.class || "Medication",
        adherence: 85,
      })) || [],
    };
  } else {
    patient = {
      ...getPatientById(patientId),
      bp: latestReading ? `${latestReading.systolic}/${latestReading.diastolic}` : "—/—",
      bpTime: latestReading ? formatRelativeTime(latestReading.timestamp) : "No data",
      trend: bpTrend,
    };
  }
  
  // Daily averages chart data (primary view)
  const dailyAvgChartData = dailyAverages.length > 0
    ? [...dailyAverages].reverse().map(da => ({
        date: new Date(da.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avgSystolic: da.avgSystolic,
        avgDiastolic: da.avgDiastolic,
        minSystolic: da.minSystolic,
        maxSystolic: da.maxSystolic,
        minDiastolic: da.minDiastolic,
        maxDiastolic: da.maxDiastolic,
        readingCount: da.readingCount,
      }))
    : [];

  // Individual readings chart data (secondary view)
  const individualChartData = bpReadings.length > 0 
    ? bpReadings.map(reading => ({
        date: new Date(reading.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        systolic: reading.systolic,
        diastolic: reading.diastolic,
      })).reverse()
    : generateBPData(patientId);

  // Use daily averages for the main chart and overall stats
  const filteredData = dailyAvgChartData.length > 0 ? dailyAvgChartData : individualChartData;

  const avgSystolic = readingsStats?.avgSystolic || 
    (dailyAvgChartData.length > 0
      ? Math.round(dailyAvgChartData.reduce((sum, d) => sum + d.avgSystolic, 0) / dailyAvgChartData.length)
      : Math.round(individualChartData.reduce((sum, d) => sum + d.systolic, 0) / individualChartData.length));
  const avgDiastolic = readingsStats?.avgDiastolic || 
    (dailyAvgChartData.length > 0
      ? Math.round(dailyAvgChartData.reduce((sum, d) => sum + d.avgDiastolic, 0) / dailyAvgChartData.length)
      : Math.round(individualChartData.reduce((sum, d) => sum + d.diastolic, 0) / individualChartData.length));
  const totalReadings = readingsStats?.totalReadings || bpReadings.length;
  const readingsPerDay = readingsStats?.readingsPerDay || 0;

  const handleSavePlan = async (plan: TreatmentPlan) => {
    const medications = plan.medications.map(med => ({
      name: med.name,
      dosage: med.dose,
      class: med.type,
      frequency: med.frequency,
    }));
    const res = await fetch(`/api/patients/${patientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medications }),
    });
    if (!res.ok) throw new Error("Failed to save");
    // Refresh patient data
    const patientRes = await fetch(`/api/patients/${patientId}`);
    if (patientRes.ok) {
      const json = await patientRes.json();
      setPatientData(json.patient || json);
    }
  };

  const patientForDrawer: Patient = {
    id: patient.id,
    name: patient.name,
    priority: patient.priority,
    bp: patient.bp,
    bpTime: patient.bpTime,
    trend: patient.trend,
    adherence: patient.adherence,
    lastContact: patient.lastContact,
    avatar: patient.avatar,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <img src={patient.avatar} alt={patient.name} className="h-14 w-14 rounded-full bg-gray-100" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-500">ID: {patient.id} • Age: {patient.age} • {patient.gender}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
            patient.priority === "Critical" && "bg-red-100 text-red-700",
            patient.priority === "Moderate" && "bg-orange-100 text-orange-700",
            patient.priority === "Stable" && "bg-green-100 text-green-700",
            patient.priority === "Follow-up" && "bg-blue-100 text-blue-700"
          )}>
            <AlertTriangle size={14} />
            {patient.priority} Priority
          </span>
          <button
            onClick={() => router.push(`/messages?patientId=${patientId}`)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <MessageSquare size={16} />
            Send Message
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Latest BP</p>
          <p className={cn(
            "text-2xl font-bold mt-1",
            patient.priority === "Critical" ? "text-red-600" : 
            patient.priority === "Moderate" ? "text-orange-600" : "text-gray-900"
          )}>{patient.bp}</p>
          <p className="text-xs text-gray-500">{patient.bpTime}</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase">BP Trend</p>
          <div className={cn(
            "flex items-center gap-2 mt-1",
            patient.trend === "up" ? "text-red-600" : 
            patient.trend === "down" ? "text-blue-600" : "text-green-600"
          )}>
            {patient.trend === "up" ? <TrendingUp size={20} /> : 
             patient.trend === "down" ? <TrendingDown size={20} /> : <Minus size={20} />}
            <span className="text-lg font-bold capitalize">
              {patient.trend === "up" ? "Rising" : patient.trend === "down" ? "Falling" : "Stable"}
            </span>
          </div>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Medication Adherence</p>
          <p className={cn(
            "text-2xl font-bold mt-1",
            patient.adherence < 50 ? "text-red-600" : 
            patient.adherence < 80 ? "text-orange-600" : "text-green-600"
          )}>{patient.adherence}%</p>
          <p className="text-xs text-gray-500">Adherence</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Last Contact</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">3 days</p>
          <p className="text-xs text-gray-500">ago</p>
        </div>
        <div className="card">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Risk Level</p>
          <p className={cn(
            "text-lg font-bold mt-1",
            patient.riskLevel === "High" ? "text-red-600" : 
            patient.riskLevel === "Medium" ? "text-orange-600" : "text-green-600"
          )}>{patient.riskLevel}</p>
          <p className="text-xs text-gray-500">Hypertensive</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* BP History Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Blood Pressure History</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {chartView === "daily-avg" ? "Daily averages from multiple readings per day" : "All individual readings"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                  <button
                    onClick={() => setChartView("daily-avg")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      chartView === "daily-avg"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Daily Avg
                  </button>
                  <button
                    onClick={() => setChartView("individual")}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      chartView === "individual"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    Individual
                  </button>
                </div>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-magenta-500 focus:outline-none"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  title="Export PDF Report"
                >
                  {exporting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <Download size={16} />
                  )}
                </button>
              </div>
            </div>
            
            {/* Chart */}
            <div className="h-72" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "daily-avg" && dailyAvgChartData.length > 0 ? (
                  <ComposedChart data={dailyAvgChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      domain={[50, 200]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<DailyAvgTooltip />} />
                    <ReferenceLine y={140} stroke="#f97316" strokeDasharray="5 5" label={{ value: "High", fontSize: 10, fill: "#f97316" }} />
                    <ReferenceLine y={90} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "Normal", fontSize: 10, fill: "#3b82f6" }} />
                    {/* Systolic range band */}
                    <Area
                      type="monotone"
                      dataKey="minSystolic"
                      stackId="sysRange"
                      stroke="none"
                      fill="transparent"
                    />
                    <Area
                      type="monotone"
                      dataKey={(d: any) => d.maxSystolic - d.minSystolic}
                      stackId="sysRange"
                      stroke="none"
                      fill="#E20074"
                      fillOpacity={0.08}
                    />
                    {/* Diastolic range band */}
                    <Area
                      type="monotone"
                      dataKey="minDiastolic"
                      stackId="diaRange"
                      stroke="none"
                      fill="transparent"
                    />
                    <Area
                      type="monotone"
                      dataKey={(d: any) => d.maxDiastolic - d.minDiastolic}
                      stackId="diaRange"
                      stroke="none"
                      fill="#3b82f6"
                      fillOpacity={0.08}
                    />
                    {/* Avg systolic line */}
                    <Line
                      type="monotone"
                      dataKey="avgSystolic"
                      stroke="#E20074"
                      strokeWidth={2.5}
                      dot={{ fill: '#E20074', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#E20074' }}
                    />
                    {/* Avg diastolic line */}
                    <Line
                      type="monotone"
                      dataKey="avgDiastolic"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: '#3b82f6' }}
                    />
                  </ComposedChart>
                ) : (
                  <LineChart data={individualChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      domain={[50, 200]}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={140} stroke="#f97316" strokeDasharray="5 5" label={{ value: "High", fontSize: 10, fill: "#f97316" }} />
                    <ReferenceLine y={90} stroke="#3b82f6" strokeDasharray="5 5" label={{ value: "Normal", fontSize: 10, fill: "#3b82f6" }} />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      stroke="#E20074" 
                      strokeWidth={2}
                      dot={{ fill: '#E20074', strokeWidth: 0, r: 2 }}
                      activeDot={{ r: 4, fill: '#E20074' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 0, r: 2 }}
                      activeDot={{ r: 4, fill: '#3b82f6' }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-magenta-600" />
                <span className="text-xs text-gray-600">{chartView === "daily-avg" ? "Avg Systolic" : "Systolic"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600">{chartView === "daily-avg" ? "Avg Diastolic" : "Diastolic"}</span>
              </div>
              {chartView === "daily-avg" && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-200" />
                  <span className="text-xs text-gray-600">Daily Range</span>
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{avgSystolic}/{avgDiastolic}</p>
                <p className="text-xs text-gray-500">Overall Average</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{totalReadings}</p>
                <p className="text-xs text-gray-500">Total Readings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{dailyAverages.length}</p>
                <p className="text-xs text-gray-500">Days Tracked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{readingsPerDay}</p>
                <p className="text-xs text-gray-500">Avg Readings/Day</p>
              </div>
            </div>
          </div>

          {/* Daily Averages Table */}
          {dailyAverages.length > 0 && (
            <div className="card p-0">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Daily BP Averages</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Averaged from multiple daily readings per patient</p>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Avg BP</th>
                    <th className="px-6 py-3 text-left">Systolic Range</th>
                    <th className="px-6 py-3 text-left">Diastolic Range</th>
                    <th className="px-6 py-3 text-center">Readings</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dailyAverages.slice(0, 14).map((da: any, index: number) => {
                    const statusLabel = da.status === 'critical' ? 'Critical' : da.status === 'high' ? 'High' : da.status === 'elevated' ? 'Elevated' : 'Normal';
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(da.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-sm font-bold",
                          da.avgSystolic >= 180 ? "text-red-600" :
                          da.avgSystolic >= 140 ? "text-orange-600" : "text-gray-900"
                        )}>
                          {da.avgSystolic}/{da.avgDiastolic}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {da.minSystolic} – {da.maxSystolic}
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {da.minDiastolic} – {da.maxDiastolic}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium",
                            da.readingCount >= 5 ? "bg-green-50 text-green-700" :
                            da.readingCount >= 3 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                          )}>
                            {da.readingCount}/5
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            statusLabel === "Critical" && "bg-red-100 text-red-700",
                            statusLabel === "High" && "bg-orange-100 text-orange-700",
                            statusLabel === "Elevated" && "bg-yellow-100 text-yellow-700",
                            statusLabel === "Normal" && "bg-green-100 text-green-700"
                          )}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Individual Readings Table */}
          <div className="card p-0">
            <div className="p-6 border-b">
              <h3 className="font-bold text-gray-900">Recent Individual Readings</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Time</th>
                  <th className="px-6 py-3 text-left">Systolic</th>
                  <th className="px-6 py-3 text-left">Diastolic</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bpReadings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                      No individual readings available yet
                    </td>
                  </tr>
                ) : (
                  bpReadings.slice(0, 10).map((reading, index) => {
                    const statusLabel =
                      reading.status === "critical"
                        ? "Critical"
                        : reading.status === "high"
                        ? "High"
                        : reading.status === "elevated"
                        ? "Elevated"
                        : "Normal";

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(reading.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(reading.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-sm font-bold",
                          reading.systolic >= 180 ? "text-red-600" :
                          reading.systolic >= 140 ? "text-orange-600" : "text-gray-900"
                        )}>
                          {reading.systolic}
                        </td>
                        <td className={cn(
                          "px-6 py-4 text-sm font-bold",
                          reading.diastolic >= 110 ? "text-red-600" :
                          reading.diastolic >= 90 ? "text-orange-600" : "text-gray-900"
                        )}>
                          {reading.diastolic}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            statusLabel === "Critical" && "bg-red-100 text-red-700",
                            statusLabel === "High" && "bg-orange-100 text-orange-700",
                            statusLabel === "Elevated" && "bg-yellow-100 text-yellow-700",
                            statusLabel === "Normal" && "bg-green-100 text-green-700"
                          )}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Medications */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Current Medications</h3>
            <div className="space-y-4">
              {patient.medications.map((med: { name: string; dose: string; type: string; adherence: number }, index: number) => (
                <div key={index} className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-900">{med.name} {med.dose}</p>
                    <span className="rounded-full bg-magenta-100 px-2 py-0.5 text-[10px] font-bold text-magenta-700">
                      Daily
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{med.type}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          med.adherence < 50 ? "bg-red-500" : 
                          med.adherence < 80 ? "bg-orange-500" : "bg-green-500"
                        )}
                        style={{ width: `${med.adherence}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{med.adherence}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Adherence Insights */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Adherence Insights</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Overall Adherence</span>
              <span className={cn(
                "text-2xl font-bold",
                patient.adherence < 50 ? "text-red-600" : 
                patient.adherence < 80 ? "text-orange-600" : "text-green-600"
              )}>{patient.adherence}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 mb-6">
              <div
                className={cn(
                  "h-full rounded-full",
                  patient.adherence < 50 ? "bg-red-500" : 
                  patient.adherence < 80 ? "bg-orange-500" : "bg-green-500"
                )}
                style={{ width: `${patient.adherence}%` }}
              />
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Missed doses (7 days)</span>
                <span className="font-bold text-gray-900">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Late doses (7 days)</span>
                <span className="font-bold text-gray-900">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">On-time doses</span>
                <span className="font-bold text-gray-900">8</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex w-full items-center gap-3 rounded-lg bg-magenta-600 p-3 text-sm font-medium text-white hover:bg-magenta-700 transition-colors"
              >
                <Pill size={18} />
                Adjust Medication
              </button>
              <button
                onClick={() => {
                  setReminderSent(false);
                  setReminderTo(patientData?.email || "");
                  setReminderOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Bell size={18} />
                Send BP Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Reminder Modal */}
      {reminderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Send BP Reminder</h3>
              <button onClick={() => setReminderOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {reminderSent ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <Send size={20} />
                </div>
                <p className="font-semibold text-gray-900">Reminder Sent!</p>
                <p className="text-sm text-gray-500 mt-1">
                  {reminderMethod === "email" ? "Email" : "SMS"} sent to {patient?.name}
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Send a BP measurement reminder to <span className="font-medium text-gray-900">{patient?.name}</span>
                </p>

                <div className="flex gap-2 mb-4">
                  {(["email", "sms"] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setReminderMethod(m);
                        setReminderTo(m === "email" ? (patientData?.email || "") : (patientData?.phone || ""));
                      }}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
                        reminderMethod === m
                          ? "border-magenta-500 bg-magenta-50 text-magenta-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {m === "email" ? "Email" : "SMS"}
                    </button>
                  ))}
                </div>

                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    {reminderMethod === "email" ? "To (email)" : "Phone"}
                  </label>
                  <input
                    value={reminderTo}
                    onChange={(e) => setReminderTo(e.target.value)}
                    placeholder={reminderMethod === "email" ? "patient@email.com" : "(xxx) xxx-xxxx"}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-magenta-500 focus:outline-none"
                  />
                </div>

                <div className="mb-5">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Message</label>
                  <textarea
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-magenta-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  onClick={handleSendReminder}
                  disabled={reminderSending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-magenta-600 py-2.5 text-sm font-semibold text-white hover:bg-magenta-700 disabled:opacity-50"
                >
                  {reminderSending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Reminder
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Treatment Plan Drawer */}
      <TreatmentPlanDrawer
        open={drawerOpen}
        patient={patientForDrawer}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSavePlan}
        initialMedications={patientData?.medications}
      />
    </div>
  );
}
