import React from "react";
import { Input } from "../../packages/ui/Input";
import { Button } from "../../packages/ui/Button";
import { Search, RefreshCw } from "lucide-react";

export interface CrudToolbarProps {
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  refreshTitle?: string;
  className?: string;
}

export function CrudToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search by code or name...",
  filters,
  actions,
  onRefresh,
  isRefreshing = false,
  refreshTitle = "Refresh List",
  className = "",
}: CrudToolbarProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4 ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}

        {filters}
      </div>

      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            title={refreshTitle}
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline ml-1.5">Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default CrudToolbar;
