import React from "react";
import { PackageOpen } from "lucide-react";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { Button } from "../../packages/ui/Button";

interface EmptyModulePlaceholderProps {
  title: string;
}

export function EmptyModulePlaceholder({ title }: EmptyModulePlaceholderProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <Breadcrumbs 
          items={[
            { label: title }
          ]} 
        />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-4">{title}</h1>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <PackageOpen className="h-10 w-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {title} Module Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
          This module has not been implemented yet. It will be built in a future milestone according to the specification.
        </p>
        <Button variant="outline">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}
