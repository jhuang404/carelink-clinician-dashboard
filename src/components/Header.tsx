import { Bell, ChevronDown } from "lucide-react";
import Link from "next/link";

/**
 * HEADER COMPONENT
 * 
 * Simplified notification area:
 * - Bell icon links to Alert Management (no ambiguous numeric badge)
 * - Clinician profile for account context only
 */

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-white px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Patient Dashboard</h1>
        <div className="hidden rounded-full bg-magenta-50 px-3 py-1 text-xs font-medium text-magenta-600 md:block">
          CareLink Doctor
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Alerts link - navigates to Alert Management page */}
        <Link 
          href="/alerts"
          className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-600 hover:bg-gray-50 hover:text-magenta-600 transition-colors"
          title="View alerts"
        >
          <Bell size={20} />
        </Link>

        {/* Clinician profile - account context only */}
        <div className="flex items-center gap-3 border-l pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">Dr. Sarah Chen</p>
            <p className="text-xs text-gray-500">Cardiologist</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              alt="Dr. Sarah Chen" 
              className="h-full w-full object-cover"
            />
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
