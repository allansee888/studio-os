import React from "react";
import { TableRow, TableCell } from "../../packages/ui/Table";
import { RefreshCw } from "lucide-react";

export interface CrudLoadingStateProps {
  message?: string;
  colSpan?: number;
  className?: string;
}

export function CrudLoadingState({
  message = "Loading records...",
  colSpan,
  className = "",
}: CrudLoadingStateProps) {
  const content = (
    <div className={`text-center py-12 text-slate-500 ${className}`}>
      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
      <span>{message}</span>
    </div>
  );

  if (colSpan !== undefined) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan}>{content}</TableCell>
      </TableRow>
    );
  }

  return content;
}

export default CrudLoadingState;
