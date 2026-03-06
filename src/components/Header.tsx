"use client";

import { Bell } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-800">Patient Dashboard</h1>
        <div className="hidden rounded-full bg-magenta-50 px-2.5 py-0.5 text-xs font-medium text-magenta-600 md:block">
          CareLink Doctor
        </div>
      </div>

      <Link 
        href="/alerts"
        className="text-gray-500 hover:text-magenta-600 transition-colors"
        title="View alerts"
      >
        <Bell size={20} />
      </Link>
    </header>
  );
}
