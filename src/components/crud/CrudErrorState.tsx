import React from "react";
import { Button } from "../../packages/ui/Button";
import { AlertCircle } from "lucide-react";

export interface CrudErrorStateProps {
  message?: string;
  error?: Error | { message?: string } | null;
  onRetry?: () => void;
  className?: string;
}

export function CrudErrorState({
  message,
  error,
  onRetry,
  className = "",
}: CrudErrorStateProps) {
  const displayMessage =
    message || error?.message || "Failed to load records. Please try again.";

  return (
    <div
      className={`p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-center justify-between ${className}`}
    >
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
        <span>{displayMessage}</span>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export default CrudErrorState;
