import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { config } from "../../config/index";

const JWT_SECRET = config.JWT_SECRET;

declare global {
  namespace Express {
    interface Request {
      user?: any;
      session?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if session is revoked
    if (decoded.sessionId) {
      const session = await prisma.session.findUnique({
        where: { id: decoded.sessionId }
      });
      
      if (!session || session.isRevoked || session.expiresAt <= new Date()) {
        return res.status(401).json({ error: "Session revoked or expired" });
      }
      
      // Update last activity
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() }
      }).catch(() => {});
      
      req.session = session;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!user || user.status !== "Active") {
      return res.status(401).json({ error: "User inactive or not found" });
    }

    // Flatten permissions & roles
    const permissions = new Set<string>();
    const roles: string[] = [];

    if (user.userRoles && Array.isArray(user.userRoles)) {
      user.userRoles.forEach((ur: any) => {
        if (ur.role) {
          roles.push(ur.role.name);
          if (ur.role.rolePermissions) {
            ur.role.rolePermissions.forEach((rp: any) => {
              if (rp.permission?.name) {
                permissions.add(rp.permission.name);
              }
            });
          }
        }
      });
    }

    if (user.userPermissions && Array.isArray(user.userPermissions)) {
      user.userPermissions.forEach((up: any) => {
        if (up.permission?.name) {
          if (up.isGranted === false) {
            permissions.delete(up.permission.name);
          } else {
            permissions.add(up.permission.name);
          }
        }
      });
    }

    const { passwordHash, ...safeUserData } = user;

    req.user = {
      ...safeUserData,
      permissions: Array.from(permissions),
      roles
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
