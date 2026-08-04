import { Request, Response, NextFunction } from "express";
import {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkRole,
  checkAnyRole,
} from "../../packages/utils/rbac";

/**
 * Middleware requiring a single permission to access an endpoint.
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = checkPermission(
      req.user.permissions || [],
      permission,
      req.user.roles || []
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware requiring ANY of the specified permissions.
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = checkAnyPermission(
      req.user.permissions || [],
      permissions,
      req.user.roles || []
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware requiring ALL of the specified permissions.
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = checkAllPermissions(
      req.user.permissions || [],
      permissions,
      req.user.roles || []
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware requiring a specific role.
 */
export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = checkRole(req.user.roles || [], role);

    if (!hasAccess) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware requiring ANY of the specified roles.
 */
export const requireAnyRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasAccess = checkAnyRole(req.user.roles || [], roles);

    if (!hasAccess) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
