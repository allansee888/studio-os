import React from "react";
import { Badge } from "../../packages/ui/Badge";

export interface CrudStatusBadgeProps {
  isActive?: boolean;
  status?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  variant?: "success" | "default" | "danger" | "warning" | "info";
  className?: string;
}

export function CrudStatusBadge({
  isActive,
  status,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  variant,
  className,
}: CrudStatusBadgeProps) {
  if (isActive !== undefined) {
    const badgeVariant = variant || (isActive ? "success" : "default");
    const label = isActive ? activeLabel : inactiveLabel;
    return (
      <Badge variant={badgeVariant} className={className}>
        {label}
      </Badge>
    );
  }

  if (status) {
    const badgeVariant = variant || "default";
    return (
      <Badge variant={badgeVariant} className={className}>
        {status}
      </Badge>
    );
  }

  return null;
}

export default CrudStatusBadge;
