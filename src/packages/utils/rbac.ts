/**
 * Utility functions for Role-Based Access Control (RBAC) permission checking.
 * Standardizes permission resolution across API middlewares and React frontend components.
 */

/**
 * Normalizes permission string to resource:action format.
 * Examples: "orders.view" -> "orders:view"
 */
export function normalizePermission(perm: string): string {
  if (!perm) return "";
  return perm.trim().toLowerCase().replace(".", ":");
}

/**
 * Checks if a user with given permissions and roles possesses a required permission.
 */
export function checkPermission(
  userPermissions: string[] = [],
  requiredPermission: string,
  userRoles: string[] = []
): boolean {
  if (!requiredPermission) return true;

  // Superadmin / Owner bypass
  const isSuperAdmin =
    userRoles.some((r) => ["administrator", "admin", "owner"].includes(r.toLowerCase())) ||
    userPermissions.includes("*") ||
    userPermissions.includes("admin:all");

  if (isSuperAdmin) return true;

  const reqNorm = normalizePermission(requiredPermission);

  return userPermissions.some((userPerm) => {
    const normUser = normalizePermission(userPerm);

    // 1. Direct match or normalized match
    if (userPerm === requiredPermission || normUser === reqNorm) {
      return true;
    }

    // 2. Wildcard resource match (e.g., "orders:*" matches "orders:view")
    if (normUser.endsWith(":*")) {
      const resourcePrefix = normUser.slice(0, -2);
      if (reqNorm.startsWith(`${resourcePrefix}:`)) {
        return true;
      }
    }

    // 3. Global wildcard "*"
    if (normUser === "*") {
      return true;
    }

    return false;
  });
}

/**
 * Checks if user has ANY of the specified permissions.
 */
export function checkAnyPermission(
  userPermissions: string[] = [],
  requiredPermissions: string[] = [],
  userRoles: string[] = []
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.some((perm) => checkPermission(userPermissions, perm, userRoles));
}

/**
 * Checks if user has ALL of the specified permissions.
 */
export function checkAllPermissions(
  userPermissions: string[] = [],
  requiredPermissions: string[] = [],
  userRoles: string[] = []
): boolean {
  if (!requiredPermissions || requiredPermissions.length === 0) return true;
  return requiredPermissions.every((perm) => checkPermission(userPermissions, perm, userRoles));
}

/**
 * Checks if user has a specific role.
 */
export function checkRole(userRoles: string[] = [], requiredRole: string): boolean {
  if (!requiredRole) return true;
  const reqLower = requiredRole.toLowerCase();
  return userRoles.some((r) => r.toLowerCase() === reqLower);
}

/**
 * Checks if user has ANY of the specified roles.
 */
export function checkAnyRole(userRoles: string[] = [], requiredRoles: string[] = []): boolean {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => checkRole(userRoles, role));
}
