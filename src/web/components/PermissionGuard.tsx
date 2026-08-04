import React from "react";
import { usePermission } from "../hooks/usePermission";

export interface PermissionGuardProps {
  /**
   * Single permission required (e.g., "orders:view" or "orders.view")
   */
  permission?: string;
  /**
   * Array of permissions required
   */
  permissions?: string[];
  /**
   * If true, all permissions in `permissions` array must be satisfied. Default is false (ANY permission).
   */
  requireAll?: boolean;
  /**
   * Single role required (e.g., "Administrator")
   */
  role?: string;
  /**
   * Array of roles allowed
   */
  roles?: string[];
  /**
   * Fallback UI to render if user lacks required permission/role
   */
  fallback?: React.ReactNode;
  /**
   * Child components to render if authorized
   */
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isLoading,
  } = usePermission();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Role check
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && permissions.length > 0) {
    const isAuthorized = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!isAuthorized) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
