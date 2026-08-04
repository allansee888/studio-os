import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePermission } from "../hooks/usePermission";
import { LoadingScreen } from "../pages/LoadingScreen";

export interface RouteGuardProps {
  /**
   * Single permission required (e.g., "orders:view")
   */
  permission?: string;
  /**
   * List of permissions required
   */
  permissions?: string[];
  /**
   * If true, all permissions must match. Default is false (ANY match).
   */
  requireAll?: boolean;
  /**
   * Required role (e.g., "Administrator")
   */
  role?: string;
  /**
   * Allowed roles
   */
  roles?: string[];
  /**
   * Redirect path if unauthorized. Defaults to "/forbidden"
   */
  redirectTo?: string;
  /**
   * Child element/route to render
   */
  children: React.ReactNode;
}

export function RouteGuard({
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  redirectTo = "/forbidden",
  children,
}: RouteGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    isLoading,
  } = usePermission();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles
  if (role && !hasRole(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check permissions
  if (permission && !hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (permissions && permissions.length > 0) {
    const isAuthorized = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!isAuthorized) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
}
