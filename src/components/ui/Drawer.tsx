"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: number;
  showOverlay?: boolean;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 520,
  showOverlay = true,
}: DrawerProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 bg-black/30 z-40 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ width }}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              {title && <h2 className="text-lg font-bold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// Sub-components for consistent drawer sections
export function DrawerHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-b px-6 py-4", className)}>
      {children}
    </div>
  );
}

export function DrawerContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex-1 overflow-y-auto p-6", className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("border-t px-6 py-4 bg-gray-50", className)}>
      {children}
    </div>
  );
}
