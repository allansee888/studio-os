import React from "react";
import { cn } from "../utils/cn";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
        {icon || <FolderOpen className="h-8 w-8 text-slate-400" />}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
