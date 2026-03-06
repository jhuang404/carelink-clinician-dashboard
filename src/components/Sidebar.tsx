"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bell, 
  MessageSquare, 
  Activity,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { name: "Patient Overview", icon: LayoutDashboard, href: "/" },
  { name: "Alert Management", icon: Bell, href: "/alerts" },
  { name: "Messages", icon: MessageSquare, href: "/messages" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { clinician, logout } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-20 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-magenta-600 text-white">
            <Activity size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">CareLink <span className="text-magenta-600">Doctor</span></span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-magenta-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Clinician profile & logout */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <img
            src={clinician?.avatar || ""}
            alt={clinician?.name || ""}
            className="h-9 w-9 rounded-full bg-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{clinician?.name}</p>
            <p className="text-xs text-gray-500 truncate">{clinician?.specialty}</p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
