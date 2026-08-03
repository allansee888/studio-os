import React from "react";
import { cn } from "../utils/cn";

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="radio"
            ref={ref}
            className={cn(
              "peer h-4 w-4 appearance-none rounded-full border border-slate-300 bg-white checked:border-[4px] checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:checked:border-blue-500",
              error && "border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label htmlFor={props.id} className="font-medium text-slate-900 dark:text-slate-100">
                {label}
              </label>
            )}
            {description && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
            {error && <p className="mt-1 text-red-500">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);
Radio.displayName = "Radio";
