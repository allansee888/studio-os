import React, { useState } from "react";
import { cn } from "../utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({ items, defaultTab, onChange, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-600 text-blue-600 dark:text-blue-500 dark:border-blue-500"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="mt-4">
        {items.find((item) => item.id === activeTab)?.content}
      </div>
    </div>
  );
}
