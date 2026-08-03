import React, { useEffect } from "react";
import { cn } from "../utils/cn";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, children, footer, className }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg sm:my-8",
          className
        )}
        role="dialog"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
        
        {(title || description) && (
          <div className="mb-4 space-y-1.5">
            {title && <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
        )}
        
        <div>{children}</div>
        
        {footer && (
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
