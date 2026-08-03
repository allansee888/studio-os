import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../utils/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
        <li>
          <Link to="/" className="flex items-center hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-400" />
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="flex items-center font-medium hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span className="flex items-center font-semibold text-slate-900 dark:text-slate-100">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
