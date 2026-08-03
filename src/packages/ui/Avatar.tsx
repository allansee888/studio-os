import React from "react";
import { cn } from "../utils/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, fallback, size = "md", className, ...props }: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-slate-200",
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img className="aspect-square h-full w-full object-cover" src={src} alt="Avatar" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-medium text-slate-600 bg-slate-200">
          {fallback || "U"}
        </div>
      )}
    </div>
  );
}
