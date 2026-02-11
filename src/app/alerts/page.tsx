"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import type { Alert as AlertType } from "@/types/api";
import { 
  Bell, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  MessageSquare, 
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ALERT STATUS MODEL
 * 
 * Each alert has a clear lifecycle:
 * - NEW: Alert just fired, requires clinician attention
 * - ACKNOWLEDGED: Clinician has seen and is working on it
 * - RESOLVED: Clinical decision made, alert closed
 * 
 * PRIMARY ACTION = Changes alert state (Acknowledge → Resolve)
 * SECONDARY ACTIONS = Clinical interventions (Call, Message) that do NOT change alert state
 */

// Legacy Alert interface for UI compatibility
interface UIAlert {
  id: string;
  status: "new" | "acknowledged" | "resolved";
  level: "critical" | "moderate" | "low";
  time: string;
  title: string;
  patient: string;
  patientId: string;
  location: string;
  bp: string;
  prevBp?: string;
  adherence?: string;
  desc: string;
  avatar: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolution?: string;
}

// Demo alert data with explicit status (fallback)
const demoAlerts: UIAlert[] = [
  {
    id: 1,
    status: "new",
    level: "critical",
    time: "2 hours ago",
    title: "Severe Hypertension Alert",
    patient: "Maria Rodriguez",
    patientId: "P-2025-001",
    location: "Rural Zone A",
    bp: "185/110",
    prevBp: "175/105",
    adherence: "45%",
    desc: "Patient's blood pressure has exceeded critical threshold. Last medication taken 3 days ago. Immediate intervention required.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
  },
  {
    id: 2,
    status: "new",
    level: "critical",
    time: "4 hours ago",
    title: "Critical BP Reading",
    patient: "Robert Thompson",
    patientId: "P-2025-002",
    location: "Rural Zone C",
    bp: "192/118",
    prevBp: "180/108",
    adherence: "45%",
    desc: "Elderly patient with comorbid CKD showing dangerously elevated BP. Risk of hypertensive crisis.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert"
  },
  {
    id: 3,
    status: "acknowledged",
    level: "moderate",
    time: "6 hours ago",
    title: "Elevated BP Trend",
    patient: "James Wilson",
    patientId: "P-2025-003",
    location: "Rural Zone B",
    bp: "165/95",
    adherence: "68%",
    desc: "Blood pressure showing consistent upward trend over past week. Patient reported stress from work.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    acknowledgedAt: "5 hours ago"
  },
  {
    id: 4,
    status: "new",
    level: "moderate",
    time: "8 hours ago",
    title: "Medication Adjustment Needed",
    patient: "Linda Martinez",
    patientId: "P-2025-004",
    location: "Rural Zone A",
    bp: "148/92",
    adherence: "78%",
    desc: "Recent medication change not showing expected results. Consider dose adjustment or alternative.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda"
  },
  {
    id: 5,
    status: "new",
    level: "low",
    time: "12 hours ago",
    title: "Missed Reading Alert",
    patient: "Patricia Lee",
    patientId: "P-2025-011",
    location: "Rural Zone B",
    bp: "—/—",
    adherence: "60%",
    desc: "Patient has not submitted BP readings for 5 days. Device connectivity issue reported.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia"
  },
];

export default function AlertManagement() {
  const [alerts, setAlerts] = useState<UIAlert[]>([]);
  const [statusFilter, setStatusFilter] = useState<"new" | "acknowledged" | "resolved" | "all">("all");
  const [loading, setLoading] = useState(true);
  
  // Fetch alerts from API
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      
      // Convert Firebase alerts to UI format
      const uiAlerts: UIAlert[] = data.alerts.map((alert: AlertType) => {
        const createdDate = new Date(alert.createdAt);
        const now = new Date();
        const hoursDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
        
        let timeStr = "";
        if (hoursDiff < 1) timeStr = "Just now";
        else if (hoursDiff < 24) timeStr = `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
        else timeStr = `${Math.floor(hoursDiff / 24)} day${Math.floor(hoursDiff / 24) > 1 ? 's' : ''} ago`;
        
        return {
          id: alert.id,
          status: alert.status,
          level: alert.severity === "critical" ? "critical" : alert.severity === "warning" ? "moderate" : "low",
          time: timeStr,
          title: alert.title,
          patient: alert.patientName,
          patientId: alert.patientId,
          location: "San Francisco, CA", // Default location
          bp: alert.triggerValue || "—/—",
          desc: alert.description,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${alert.patientId}`,
          acknowledgedAt: alert.acknowledgedAt ? formatRelativeTime(alert.acknowledgedAt) : undefined,
          resolvedAt: alert.resolvedAt ? formatRelativeTime(alert.resolvedAt) : undefined,
          resolution: alert.resolution,
        };
      });
      
      setAlerts(uiAlerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      // Fallback to demo data on error
      setAlerts(demoAlerts);
    } finally {
      setLoading(false);
    }
  };
  
  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const hoursDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (hoursDiff < 1) return "Just now";
    if (hoursDiff < 24) return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} ago`;
    return `${Math.floor(hoursDiff / 24)} day${Math.floor(hoursDiff / 24) > 1 ? 's' : ''} ago`;
  };

  // Calculate stats from current alert state
  const stats = {
    critical: alerts.filter(a => a.level === "critical" && a.status !== "resolved").length,
    moderate: alerts.filter(a => a.level === "moderate" && a.status !== "resolved").length,
    low: alerts.filter(a => a.level === "low" && a.status !== "resolved").length,
    newCount: alerts.filter(a => a.status === "new").length,
    acknowledgedCount: alerts.filter(a => a.status === "acknowledged").length,
  };

  /**
   * ACKNOWLEDGE ALERT
   * Clinician has reviewed this alert and is aware of it.
   * Does NOT mean the issue is resolved - just that it's being handled.
   */
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'acknowledged' }),
      });
      
      if (!response.ok) throw new Error('Failed to acknowledge alert');
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: "acknowledged", acknowledgedAt: "Just now" }
          : alert
      ));
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  /**
   * RESOLVE ALERT
   * Clinician has made a clinical decision and this alert can be closed.
   * This is the terminal state - alert is considered handled.
   */
  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'resolved', resolution: 'Issue addressed by clinician' }),
      });
      
      if (!response.ok) throw new Error('Failed to resolve alert');
      
      // Update local state
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: "resolved", resolvedAt: "Just now" }
          : alert
      ));
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  /**
   * SECONDARY ACTIONS
   * These are clinical interventions that do NOT change alert state.
   * Calling or messaging a patient is an action, but doesn't mean the alert is resolved.
   */
  const handleCall = (alert: UIAlert) => {
    console.log(`Initiating call to ${alert.patient}`);
    // TODO: Integrate with calling system
  };

  const handleMessage = (alert: UIAlert) => {
    console.log(`Opening message composer for ${alert.patient}`);
    // TODO: Open message modal
  };

  // Filter alerts by status
  const filteredAlerts = statusFilter === "all" 
    ? alerts.filter(a => a.status !== "resolved")
    : alerts.filter(a => a.status === statusFilter);

  const getLevelStyles = (level: string) => {
    switch (level) {
      case "critical":
        return { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-600", badge: "bg-red-100 text-red-800" };
      case "moderate":
        return { border: "border-l-orange-500", bg: "bg-orange-50", text: "text-orange-600", badge: "bg-orange-100 text-orange-800" };
      default:
        return { border: "border-l-yellow-500", bg: "bg-yellow-50", text: "text-yellow-600", badge: "bg-yellow-100 text-yellow-800" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>
          <p className="text-gray-500">Monitor and respond to patient health alerts</p>
        </div>
        <div className="flex gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | "all")}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:border-magenta-500"
          >
            <option value="all">All Active ({stats.newCount + stats.acknowledgedCount})</option>
            <option value="new">New ({stats.newCount})</option>
            <option value="acknowledged">Acknowledged ({stats.acknowledgedCount})</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert Stats by Severity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { level: "Critical", count: stats.critical, sub: "Immediate attention required", color: "red" },
          { level: "Moderate", count: stats.moderate, sub: "Review within 24 hours", color: "orange" },
          { level: "Low Priority", count: stats.low, sub: "Routine follow-up needed", color: "yellow" },
        ].map((stat) => (
          <div key={stat.level} className="card relative overflow-hidden">
            <div className={cn(
              "absolute top-0 left-0 w-1 h-full",
              stat.color === 'red' ? 'bg-red-500' : 
              stat.color === 'orange' ? 'bg-orange-500' : 'bg-yellow-500'
            )} />
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-lg",
                    stat.color === 'red' ? 'bg-red-50 text-red-600' : 
                    stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-yellow-50 text-yellow-600'
                  )}>
                    <Bell size={20} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{stat.level}</span>
                </div>
                <p className="mt-4 text-3xl font-bold text-gray-900">{stat.count}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex flex-1 items-center gap-4 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search alerts by patient name or ID..." 
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-magenta-500"
            />
          </div>
          <select className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none">
            <option>Sort by Priority</option>
            <option>Sort by Time</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="card text-center py-12">
            <CheckCircle2 size={48} className="mx-auto text-green-400 mb-4" />
            <p className="text-gray-500">
              {statusFilter === "resolved" 
                ? "No resolved alerts to show" 
                : "All alerts have been handled"}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const styles = getLevelStyles(alert.level);
            
            return (
              <div 
                key={alert.id} 
                className={cn(
                  "card relative overflow-hidden border-l-4",
                  styles.border,
                  alert.status === "acknowledged" && "opacity-80"
                )}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  {/* Alert Content */}
                  <div className="flex flex-1 gap-4">
                    <div className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                      styles.bg, styles.text
                    )}>
                      {alert.status === "acknowledged" ? <Clock size={24} /> : <Bell size={24} />}
                    </div>
                    <div className="space-y-4 flex-1">
                      {/* Status + Level + Time */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Alert Status Badge */}
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          alert.status === "new" && "bg-blue-100 text-blue-800",
                          alert.status === "acknowledged" && "bg-gray-100 text-gray-600"
                        )}>
                          {alert.status === "new" && <AlertTriangle size={12} />}
                          {alert.status === "acknowledged" && <Clock size={12} />}
                          {alert.status === "new" ? "New" : "Acknowledged"}
                        </span>
                        {/* Severity Badge */}
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          styles.badge
                        )}>
                          {alert.level}
                        </span>
                        <span className="text-xs text-gray-400">{alert.time}</span>
                        {alert.acknowledgedAt && (
                          <span className="text-xs text-gray-400">• Acknowledged {alert.acknowledgedAt}</span>
                        )}
                      </div>

                      {/* Title + Patient Info */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{alert.title}</h3>
                        <div className="mt-2 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <img src={alert.avatar} alt={alert.patient} className="h-6 w-6 rounded-full" />
                            <span className="text-sm font-bold text-gray-900">{alert.patient}</span>
                          </div>
                          <span className="text-xs text-gray-400">ID: {alert.patientId} | {alert.location}</span>
                        </div>
                      </div>

                      {/* Clinical Data */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className={cn("rounded-xl p-4", styles.bg)}>
                          <p className={cn("text-[10px] font-bold uppercase", styles.text)}>Blood Pressure</p>
                          <p className={cn("mt-1 text-xl font-bold", alert.bp === "—/—" ? "text-gray-400" : styles.text.replace("text-", "text-").replace("600", "700"))}>
                            {alert.bp}
                          </p>
                        </div>
                        {alert.prevBp && (
                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Previous Reading</p>
                            <p className="mt-1 text-xl font-bold text-gray-700">{alert.prevBp}</p>
                          </div>
                        )}
                        {alert.adherence && (
                          <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Medication Adherence</p>
                            <p className="mt-1 text-xl font-bold text-gray-700">{alert.adherence}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed">{alert.desc}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 min-w-[160px]">
                    {/* PRIMARY ACTION: Changes alert state */}
                    {alert.status === "new" ? (
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-magenta-600 py-2.5 text-sm font-medium text-white hover:bg-magenta-700"
                      >
                        <Check size={18} />
                        Acknowledge
                      </button>
                    ) : (
                      <button 
                        onClick={() => resolveAlert(alert.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <CheckCircle2 size={18} />
                        Resolve
                      </button>
                    )}

                    {/* SECONDARY ACTIONS: Clinical interventions (do NOT change alert state) */}
                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => handleCall(alert)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        title="Call patient - does not resolve alert"
                      >
                        <Phone size={16} />
                        Call
                      </button>
                      <button 
                        onClick={() => handleMessage(alert)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        title="Message patient - does not resolve alert"
                      >
                        <MessageSquare size={16} />
                        Message
                      </button>
                    </div>
                    
                    {/* Helper text */}
                    <p className="text-[10px] text-gray-400 text-center mt-1">
                      {alert.status === "new" 
                        ? "Acknowledge to mark as in-progress"
                        : "Resolve when clinical action is complete"
                      }
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
