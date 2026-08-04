import { useAuthStore, User } from "../store/authStore";
import {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkAnyRole,
} from "../../packages/utils/rbac";

export interface UsePermissionResult {
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  permissions: string[];
  roles: string[];
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function usePermission(): UsePermissionResult {
  const { user, isLoading, isAuthenticated } = useAuthStore();

  const permissions = user?.permissions || [];
  const roles = user?.roles || (user?.role ? [user.role] : []);

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return checkPermission(permissions, permission, roles);
  };

  const hasAnyPermission = (reqPermissions: string[]): boolean => {
    if (!user) return false;
    return checkAnyPermission(permissions, reqPermissions, roles);
  };

  const hasAllPermissions = (reqPermissions: string[]): boolean => {
    if (!user) return false;
    return checkAllPermissions(permissions, reqPermissions, roles);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return checkRole(roles, role);
  };

  const hasAnyRole = (reqRoles: string[]): boolean => {
    if (!user) return false;
    return checkAnyRole(roles, reqRoles);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions,
    roles,
    user,
    isLoading,
    isAuthenticated,
  };
}
