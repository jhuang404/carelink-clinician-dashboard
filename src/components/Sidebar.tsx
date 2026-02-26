"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bell, 
  MessageSquare, 
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Patient Overview", icon: LayoutDashboard, href: "/" },
  { name: "Alert Management", icon: Bell, href: "/alerts" },
  { name: "Messages", icon: MessageSquare, href: "/messages" },
];

export default function Sidebar() {
  const pathname = usePathname();

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

      <div className="border-t p-4">
        <div className="rounded-xl bg-magenta-50 p-4">
          <p className="text-xs font-bold text-magenta-700 uppercase tracking-wider">Quick Tip</p>
          <p className="mt-1 text-xs text-magenta-600">
            Click "Edit Plan" on any patient row to quickly update their treatment plan.
          </p>
        </div>
      </div>
    </aside>
  );
}
