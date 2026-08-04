import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../packages/ui/Table";
import { CrudLoadingState } from "./CrudLoadingState";
import { CrudEmptyState } from "./CrudEmptyState";
import { ArrowUpDown } from "lucide-react";

export interface CrudTableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (item: T) => React.ReactNode;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  sortField?: string;
  align?: "left" | "center" | "right";
  width?: string;
  className?: string;
  headerClassName?: string;
}

export interface CrudTableProps<T> {
  columns: CrudTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  emptyAction?: React.ReactNode;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  onRowClick?: (item: T) => void;
  rowClassName?: string | ((item: T) => string);
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function CrudTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  emptyTitle = "No items found",
  emptyDescription = "No records match the selected search criteria or filters.",
  emptyIcon,
  emptyAction,
  onSort,
  onRowClick,
  rowClassName,
  footer,
  children,
  className = "",
}: CrudTableProps<T>) {
  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  const alignJustifyClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "justify-center";
    if (align === "right") return "justify-end";
    return "justify-start";
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => {
              const sortField = col.sortField || col.key;
              const isSortable = col.sortable && onSort;

              return (
                <TableHead
                  key={col.key}
                  className={`${col.width ? col.width : ""} ${alignClass(
                    col.align
                  )} ${
                    isSortable ? "cursor-pointer select-none" : ""
                  } ${col.headerClassName || ""}`}
                  onClick={() => {
                    if (isSortable) onSort(sortField);
                  }}
                >
                  {isSortable ? (
                    <div
                      className={`flex items-center gap-1 ${alignJustifyClass(
                        col.align
                      )}`}
                    >
                      <span>{col.header}</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <CrudLoadingState colSpan={columns.length} />
          ) : isError || data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-8 text-center">
                <CrudEmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  icon={emptyIcon}
                  action={emptyAction}
                />
              </TableCell>
            </TableRow>
          ) : children ? (
            children
          ) : (
            data.map((item, index) => {
              const key = keyExtractor(item);
              const customRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(item)
                  : rowClassName || "";

              return (
                <TableRow
                  key={key}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${customRowClass}`}
                >
                  {columns.map((col) => {
                    const cellContent = col.render
                      ? col.render(item, index)
                      : col.accessor
                      ? col.accessor(item)
                      : (item as any)[col.key];

                    return (
                      <TableCell
                        key={col.key}
                        className={`${alignClass(col.align)} ${
                          col.className || ""
                        }`}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {footer}
    </div>
  );
}

export default CrudTable;
