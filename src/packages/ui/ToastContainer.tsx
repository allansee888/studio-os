import React from 'react';
import { useToastStore } from './ToastProvider';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-[100] m-4 flex w-full max-w-sm flex-col gap-2 sm:m-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-white p-4 shadow-lg animate-in slide-in-from-right-full",
            toast.type === 'error' && "border-red-200 bg-red-50 text-red-900",
            toast.type === 'success' && "border-green-200 bg-green-50 text-green-900",
            toast.type === 'warning' && "border-yellow-200 bg-yellow-50 text-yellow-900"
          )}
        >
          <div className="shrink-0 pt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
            {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
            {(!toast.type || toast.type === 'default') && <Info className="h-5 w-5 text-blue-600" />}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-medium leading-none tracking-tight">
              {toast.title}
            </h3>
            {toast.description && (
              <p className="text-sm opacity-90">{toast.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
