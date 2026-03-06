"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { clinician } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b bg-white px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Patient Dashboard</h1>
        <div className="hidden rounded-full bg-magenta-50 px-3 py-1 text-xs font-medium text-magenta-600 md:block">
          CareLink Doctor
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Link 
          href="/alerts"
          className="flex h-10 w-10 items-center justify-center rounded-full border bg-white text-gray-600 hover:bg-gray-50 hover:text-magenta-600 transition-colors"
          title="View alerts"
        >
          <Bell size={20} />
        </Link>

        <div className="flex items-center gap-3 border-l pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{clinician?.name || "Clinician"}</p>
            <p className="text-xs text-gray-500">{clinician?.specialty || ""}</p>
          </div>
          <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
            <img 
              src={clinician?.avatar || ""} 
              alt={clinician?.name || ""} 
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
