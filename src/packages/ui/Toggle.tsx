import React from "react";
import { cn } from "../utils/cn";

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className="flex items-center justify-between">
        {(label || description) && (
          <div className="text-sm pr-4">
            {label && (
              <label htmlFor={props.id} className="font-medium text-slate-900 dark:text-slate-100">
                {label}
              </label>
            )}
            {description && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        )}
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" ref={ref} className="sr-only peer" {...props} />
          <div className={cn(
            "w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600",
            className
          )}></div>
        </label>
      </div>
    );
  }
);
Toggle.displayName = "Toggle";
