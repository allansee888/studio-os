import React from "react";
import { Card, CardContent } from "./Card";
import { cn } from "../utils/cn";

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: "up" | "down" | "neutral";
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mt-1">{value}</p>
          </div>
          {icon && (
            <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={cn(
                "font-medium mr-2 flex items-center",
                trend.direction === "up" ? "text-green-600 dark:text-green-400" : "",
                trend.direction === "down" ? "text-red-600 dark:text-red-400" : "",
                trend.direction === "neutral" ? "text-slate-600 dark:text-slate-400" : ""
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.direction === "neutral" && "−"}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
