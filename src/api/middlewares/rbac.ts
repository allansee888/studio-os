import { Request, Response, NextFunction } from "express";

export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const hasPermission = permissions.some(p => req.user.permissions?.includes(p));
    
    if (!hasPermission) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
