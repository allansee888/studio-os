import React from "react";
import { EmptyState } from "../../packages/ui/EmptyState";
import { FolderOpen } from "lucide-react";

export interface CrudEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CrudEmptyState({
  title = "No items found",
  description = "No records match the selected search criteria or filters.",
  icon = <FolderOpen className="w-8 h-8 text-slate-400" />,
  action,
  className,
}: CrudEmptyStateProps) {
  return (
    <div className={className}>
      <EmptyState
        title={title}
        description={description}
        icon={icon}
        action={action}
      />
    </div>
  );
}

export default CrudEmptyState;
