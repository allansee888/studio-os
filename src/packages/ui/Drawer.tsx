import React, { useEffect } from "react";
import { cn } from "../utils/cn";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "right" | "left";
  className?: string;
}

export function Drawer({ isOpen, onClose, title, children, position = "right", className }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div 
        className={cn(
          "fixed inset-y-0 flex max-w-full",
          position === "right" ? "right-0 pl-10" : "left-0 pr-10"
        )}
      >
        <div className="w-screen max-w-md transform transition-transform">
          <div className={cn("flex h-full flex-col bg-white shadow-xl", className)}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
              <button
                onClick={onClose}
                className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1 px-6 py-6 overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
