import React from "react";
import { Breadcrumbs } from "../../packages/ui/Breadcrumbs";
import { AlertCircle, FolderTree } from "lucide-react";

export interface CrudPageBreadcrumbItem {
  label: string;
  href?: string;
}

export interface CrudPageProps {
  title: string;
  description?: string;
  breadcrumbs?: CrudPageBreadcrumbItem[];
  primaryAction?: React.ReactNode;
  feedbackMessage?: string | null;
  feedbackIcon?: React.ReactNode;
  accessDenied?: boolean;
  accessDeniedMessage?: string;
  toolbar?: React.ReactNode;
  table?: React.ReactNode;
  pagination?: React.ReactNode;
  dialogs?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function CrudPage({
  title,
  description,
  breadcrumbs,
  primaryAction,
  feedbackMessage,
  feedbackIcon = <FolderTree className="w-5 h-5 text-blue-400 dark:text-blue-600" />,
  accessDenied = false,
  accessDeniedMessage = "You do not have permission to view this page.",
  toolbar,
  table,
  pagination,
  dialogs,
  children,
  className = "space-y-6",
}: CrudPageProps) {
  if (accessDenied) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Access Denied
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          {accessDeniedMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Toast / Action Feedback Banner */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium flex items-center gap-2 animate-in fade-in-50">
          {feedbackIcon}
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} />
          )}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {primaryAction && <div>{primaryAction}</div>}
      </div>

      {/* Toolbar Slot */}
      {toolbar}

      {/* Table & Pagination Slot or Children */}
      {table || pagination ? (
        <div className="space-y-0">
          {table}
          {pagination}
        </div>
      ) : (
        children
      )}

      {/* Dialogs / Modals Slot */}
      {dialogs}
    </div>
  );
}

export default CrudPage;
