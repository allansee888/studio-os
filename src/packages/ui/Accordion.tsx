import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/cn";

export interface AccordionItemProps {
  title: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, content, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left font-medium text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-slate-500 transition-transform duration-200",
            isOpen ? "rotate-180 transform" : ""
          )}
        />
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-slate-500 dark:text-slate-400">
          {content}
        </div>
      )}
    </div>
  );
}

export interface AccordionProps {
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ children, className }: AccordionProps) {
  return (
    <div className={cn("w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4", className)}>
      {children}
    </div>
  );
}
