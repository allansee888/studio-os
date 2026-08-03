import React from "react";
import { cn } from "../utils/cn";

export interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  colorClassName?: string;
  showLabel?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className,
  colorClassName = "bg-blue-600 dark:bg-blue-500",
  showLabel = false
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>{value}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500 ease-in-out", colorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
