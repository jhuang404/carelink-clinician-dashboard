"use client";

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Users,
  TrendingUp,
  TrendingDown,
  Heart,
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  Info,
  ChevronRight,
  BarChart3,
  MapPin,
  Shield,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

/**
 * ANALYTICS DASHBOARD
 * 
 * ROLE: Secondary, admin-facing view for population health insights.
 * NOT intended for primary clinical decision-making.
 * 
 * DESIGN PRINCIPLES:
 * - Aggregated synthetic data for demo
 * - All sections drill down to patient-level views
 * - Non-time-critical presentation (no urgency indicators)
 * - Supports understanding & reporting, not interrupting workflows
 * 
 * TODO (Backend Integration):
 * - Fetch aggregated analytics: GET /api/analytics/summary
 * - Export report: GET /api/analytics/export?format=pdf
 * - Drill-down API: GET /api/patients?filter=risk_level:high
 */

// ============ SYNTHETIC DEMO DATA ============

const populationTrendData = [
  { month: "Jan", bpControl: 65, adherence: 72, outcomes: 68 },
  { month: "Feb", bpControl: 68, adherence: 75, outcomes: 71 },
  { month: "Mar", bpControl: 72, adherence: 78, outcomes: 74 },
  { month: "Apr", bpControl: 76, adherence: 80, outcomes: 78 },
  { month: "May", bpControl: 80, adherence: 82, outcomes: 81 },
  { month: "Jun", bpControl: 83, adherence: 84, outcomes: 85 },
];

const adherenceData = [
  { name: "Excellent (90-100%)", value: 45, color: "#22c55e" },
  { name: "Good (70-89%)", value: 52, color: "#84cc16" },
  { name: "Poor (50-69%)", value: 23, color: "#f59e0b" },
  { name: "Critical (<50%)", value: 7, color: "#ef4444" },
];

const geographicData = [
  { zone: "Rural Zone A", patients: 42, bpControl: 82 },
  { zone: "Rural Zone B", patients: 38, bpControl: 75 },
  { zone: "Rural Zone C", patients: 47, bpControl: 79 },
];

const riskStratificationData = [
  { level: "High Risk", count: 23, color: "#ef4444", icon: AlertTriangle },
  { level: "Medium Risk", count: 45, color: "#f59e0b", icon: AlertTriangle },
  { level: "Low Risk", count: 59, color: "#22c55e", icon: CheckCircle2 },
];

const detailedMetrics = [
  { metric: "Average Systolic BP", current: "138.2 mmHg", previous: "142.1 mmHg", change: -3.9, target: "<130 mmHg", status: "improving" },
  { metric: "Medication Adherence", current: "84.2%", previous: "82.4%", change: 1.8, target: ">85%", status: "near-target" },
  { metric: "Follow-up Completion", current: "91.3%", previous: "89.7%", change: 1.6, target: ">90%", status: "on-target" },
  { metric: "Alert Response Time", current: "2.4 hrs", previous: "3.1 hrs", change: -22.6, target: "<4 hrs", status: "on-target" },
];

// ============ COMPONENT ============

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30");
  const [trendTab, setTrendTab] = useState<"bpControl" | "adherence" | "outcomes">("bpControl");
  const [detailTab, setDetailTab] = useState<"outcomes" | "interventions" | "costs">("outcomes");

  const getTrendKey = () => {
    switch (trendTab) {
      case "bpControl": return "bpControl";
      case "adherence": return "adherence";
      case "outcomes": return "outcomes";
    }
  };

  const handleDrillDown = (filter: string) => {
    // Navigate to patient list with filter
    router.push(`/?filter=${encodeURIComponent(filter)}`);
  };

  const handleExportReport = () => {
    // TODO: Implement actual export
    alert("Export functionality - would generate PDF/CSV report");
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Admin Context */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Info size={12} />
              Admin Preview
            </span>
            <span className="text-sm text-gray-500">
              Population-level insights · Not for clinical decision-making
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 rounded-lg bg-magenta-600 px-4 py-2 text-sm font-medium text-white hover:bg-magenta-700"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-blue-900">
              This dashboard shows aggregated population health metrics for reporting purposes.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Click any metric card to drill down to the underlying patient list. Data shown is synthetic for demo.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Population Health Score"
          value="78.5%"
          change={3.2}
          icon={Activity}
          onClick={() => handleDrillDown("all")}
        />
        <SummaryCard
          title="Avg Adherence Rate"
          value="84.2%"
          change={1.8}
          icon={Heart}
          onClick={() => handleDrillDown("adherence:low")}
        />
        <SummaryCard
          title="Treatment Effectiveness"
          value="91.7%"
          change={2.1}
          icon={TrendingUp}
          onClick={() => handleDrillDown("treatment:effective")}
        />
        <SummaryCard
          title="Intervention Success"
          value="87.3%"
          change={-0.5}
          icon={CheckCircle2}
          onClick={() => handleDrillDown("interventions")}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Population Health Trends */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Population Health Trends</h3>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              {[
                { key: "bpControl", label: "BP Control" },
                { key: "adherence", label: "Adherence" },
                { key: "outcomes", label: "Outcomes" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setTrendTab(tab.key as typeof trendTab)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    trendTab === tab.key
                      ? "bg-magenta-600 text-white"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={populationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis domain={[60, 90]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={getTrendKey()}
                  stroke="#E20074"
                  strokeWidth={2}
                  dot={{ fill: "#E20074", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">73</p>
              <p className="text-xs text-gray-500">Controlled<br/>patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">31</p>
              <p className="text-xs text-gray-500">Improving<br/>patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">23</p>
              <p className="text-xs text-gray-500">At Risk<br/>patients</p>
            </div>
          </div>
        </div>

        {/* Medication Adherence */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Medication Adherence</h3>
            <button
              onClick={() => handleDrillDown("adherence:all")}
              className="text-gray-400 hover:text-magenta-600"
            >
              <ExternalLink size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adherenceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    labelLine={false}
                  >
                    {adherenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {adherenceData.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleDrillDown(`adherence:${item.name.split(" ")[0].toLowerCase()}`)}
                  className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.value} patients</span>
                    <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Treatment Effectiveness */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Treatment Effectiveness</h3>
            <select className="text-xs border rounded px-2 py-1">
              <option>All Treatments</option>
            </select>
          </div>
          <div className="space-y-4">
            {[
              { label: "BP Target Achievement", value: 87, color: "bg-magenta-500" },
              { label: "Side Effect Rate", value: 12, color: "bg-orange-400" },
              { label: "Treatment Compliance", value: 84, color: "bg-green-500" },
              { label: "Quality of Life Score", value: 78, color: "bg-blue-500", suffix: "/10", displayValue: "7.8" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{item.displayValue || `${item.value}%`}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", item.color)}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Insights */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Geographic Insights</h3>
            <MapPin size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {geographicData.map((zone) => (
              <button
                key={zone.zone}
                onClick={() => handleDrillDown(`zone:${zone.zone.toLowerCase().replace(/\s/g, "-")}`)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">{zone.zone}</span>
                  <span className="text-sm text-gray-500">{zone.patients} patients</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">Avg BP Control: {zone.bpControl}%</div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${zone.bpControl}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Risk Stratification */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Risk Stratification</h3>
            <Shield size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {riskStratificationData.map((risk) => (
              <button
                key={risk.level}
                onClick={() => handleDrillDown(`risk:${risk.level.toLowerCase().replace(/\s/g, "-")}`)}
                className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${risk.color}20` }}
                  >
                    <risk.icon size={16} style={{ color: risk.color }} />
                  </div>
                  <span className="font-medium text-gray-900">{risk.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: risk.color }}
                  >
                    {risk.count} patients
                  </span>
                  <ChevronRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
          
          {/* Risk Distribution Bar */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">Risk Distribution</p>
            <div className="h-3 flex rounded-full overflow-hidden">
              {riskStratificationData.map((risk) => (
                <div
                  key={risk.level}
                  style={{
                    backgroundColor: risk.color,
                    width: `${(risk.count / 127) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics Table */}
      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Analytics</h3>
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            {[
              { key: "outcomes", label: "Outcomes" },
              { key: "interventions", label: "Interventions" },
              { key: "costs", label: "Costs" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDetailTab(tab.key as typeof detailTab)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  detailTab === tab.key
                    ? "bg-magenta-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {detailedMetrics.map((row) => (
                <tr key={row.metric} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.metric}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{row.current}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.previous}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      row.change > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {row.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {row.change > 0 ? "+" : ""}{row.change}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{row.target}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      row.status === "on-target" && "bg-green-100 text-green-700",
                      row.status === "near-target" && "bg-yellow-100 text-yellow-700",
                      row.status === "improving" && "bg-blue-100 text-blue-700"
                    )}>
                      {row.status === "on-target" && "On Target"}
                      {row.status === "near-target" && "Near Target"}
                      {row.status === "improving" && "Improving"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Last updated: {new Date().toLocaleString()}
          </span>
          <span>•</span>
          <span>Synthetic demo data for illustration only</span>
        </div>
        <span>
          For clinical decisions, use Patient Overview dashboard
        </span>
      </div>
    </div>
  );
}

// ============ SUB-COMPONENTS ============

interface SummaryCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  onClick: () => void;
}

function SummaryCard({ title, value, change, icon: Icon, onClick }: SummaryCardProps) {
  const isPositive = change > 0;
  
  return (
    <button
      onClick={onClick}
      className="rounded-xl border bg-white p-5 text-left hover:border-magenta-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-magenta-50">
          <Icon size={18} className="text-gray-400 group-hover:text-magenta-600" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <div className="flex items-center gap-1">
        {isPositive ? (
          <TrendingUp size={14} className="text-green-500" />
        ) : (
          <TrendingDown size={14} className="text-red-500" />
        )}
        <span className={cn(
          "text-sm font-medium",
          isPositive ? "text-green-600" : "text-red-600"
        )}>
          {isPositive ? "+" : ""}{change}%
        </span>
        <span className="text-sm text-gray-400">from last month</span>
      </div>
    </button>
  );
}
