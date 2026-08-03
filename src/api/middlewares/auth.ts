import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-in-production";

// Extend Request type to include user
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
      
      if (!session || session.isRevoked) {
        return res.status(401).json({ error: "Session revoked or invalid" });
      }
      
      // Update last activity
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActivity: new Date() }
      });
      
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
        }
      }
    });

    if (!user || user.status !== "Active") {
      return res.status(401).json({ error: "User inactive or not found" });
    }

    // Flatten permissions
    const permissions = new Set<string>();
    user.userRoles.forEach((ur: any) => {
      ur.role.rolePermissions.forEach((rp: any) => {
        permissions.add(rp.permission.name);
      });
    });

    req.user = {
      ...user,
      permissions: Array.from(permissions)
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
