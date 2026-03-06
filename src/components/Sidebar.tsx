"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bell, 
  MessageSquare, 
  Activity,
  LogOut,
  Settings,
  ChevronUp,
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      {/* Clinician profile with popover menu */}
      <div className="relative border-t p-3" ref={menuRef}>
        {/* Popover menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-500">{clinician?.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">{clinician?.role}</p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 transition-colors",
            menuOpen ? "bg-gray-100" : "hover:bg-gray-50"
          )}
        >
          <img
            src={clinician?.avatar || ""}
            alt={clinician?.name || ""}
            className="h-9 w-9 rounded-full bg-gray-200 shrink-0"
          />
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate">{clinician?.name}</p>
            <p className="text-xs text-gray-500 truncate">{clinician?.specialty}</p>
          </div>
          <ChevronUp
            size={16}
            className={cn(
              "shrink-0 text-gray-400 transition-transform duration-200",
              menuOpen ? "rotate-0" : "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
}
