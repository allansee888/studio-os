import React from "react";
import { Button } from "../../packages/ui/Button";
import { Select } from "../../packages/ui/Select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CrudPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  itemLabel?: string;
  onPageChange: (newPage: number) => void;
  onLimitChange?: (newLimit: number) => void;
  limitOptions?: number[];
  isLoading?: boolean;
  className?: string;
}

export function CrudPagination({
  page,
  limit,
  total,
  totalPages,
  itemLabel = "items",
  onPageChange,
  onLimitChange,
  limitOptions = [5, 10, 25, 50],
  isLoading = false,
  className = "",
}: CrudPaginationProps) {
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);
  const safeTotalPages = totalPages || 1;

  return (
    <div
      className={`p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-slate-500 ${className}`}
    >
      <div>
        Showing{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {total}
        </span>{" "}
        {itemLabel}
      </div>

      <div className="flex items-center gap-3">
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <Select
              value={limit.toString()}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="w-16 text-xs"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-2 text-xs font-medium">
            Page {page} of {safeTotalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= safeTotalPages || isLoading}
            onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CrudPagination;
