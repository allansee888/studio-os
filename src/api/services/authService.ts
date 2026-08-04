import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../../db/prisma";
import { config } from "../../config/index";
import { LoginInput } from "../../packages/validation/auth";

const JWT_SECRET = config.JWT_SECRET;
// Dummy bcrypt hash for timing attack mitigation when user is not found
const DUMMY_HASH = "$2a$10$7r1K6FmP1/j2bW5K5d1NNe3bC8mY.lE4g/H8Kz.0Q4Q2K1z5w.W2y";

export interface AuthUserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  requiresPasswordChange: boolean;
  status: string;
  permissions: string[];
  roles: string[];
}

const userIncludes = {
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: { permission: true }
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
};

export class AuthService {
  /**
   * Authenticates a user by email or username and password.
   */
  static async login(input: LoginInput, clientIp?: string, userAgent?: string) {
    const rawId = input.identifier || input.email || input.username || "";
    const loginId = rawId.trim();

    // Query user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: loginId, mode: "insensitive" } },
          { username: { equals: loginId, mode: "insensitive" } }
        ]
      },
      include: userIncludes
    });

    // Timing attack defense: if user doesn't exist, run dummy compare
    if (!user) {
      await bcrypt.compare(input.password, DUMMY_HASH);
      throw new AuthError("Invalid email/username or password", 401);
    }

    // Check account status
    if (user.status !== "Active") {
      throw new AuthError("Invalid email/username or password", 401);
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AuthError("Account is temporarily locked due to failed attempts. Please try again later.", 401);
    }

    // Verify password using bcrypt
    const isValid = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValid) {
      const failedLogins = user.failedLogins + 1;
      const lockedUntil = failedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins, lockedUntil }
      });

      throw new AuthError("Invalid email/username or password", 401);
    }

    // Reset failed logins on success & update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLogin: new Date() }
    });

    // Expiration duration for refresh token
    const rememberMe = !!input.rememberMe;
    const sessionDays = rememberMe ? 30 : 1;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + sessionDays);

    // Create session in database
    const tokenPayload = { userId: user.id, type: "refresh", jti: crypto.randomUUID() };
    const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: `${sessionDays}d` });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        ipAddress: clientIp || null,
        browser: userAgent || null,
        expiresAt
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "Login",
        ipAddress: clientIp || null,
        details: JSON.stringify({ rememberMe, userAgent })
      }
    });

    // Access token (JWT, valid for 1 hour)
    const accessToken = jwt.sign(
      { userId: user.id, sessionId: session.id, type: "access" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const formattedUser = this.formatUserPayload(user);

    return {
      user: formattedUser,
      accessToken,
      refreshToken,
      expiresAt
    };
  }

  /**
   * Refreshes access token and refresh token using a valid session.
   */
  static async refresh(refreshToken: string, clientIp?: string, userAgent?: string) {
    if (!refreshToken) {
      throw new AuthError("Refresh token required", 401);
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      throw new AuthError("Invalid or expired refresh token", 401);
    }

    // Lookup session in DB
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: userIncludes
        }
      }
    });

    if (!session || session.isRevoked || session.expiresAt <= new Date()) {
      throw new AuthError("Session revoked or expired", 401);
    }

    if (!session.user || session.user.status !== "Active") {
      throw new AuthError("User account inactive", 401);
    }

    // Update last activity
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActivity: new Date() }
    });

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: session.userId, sessionId: session.id, type: "access" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const formattedUser = this.formatUserPayload(session.user);

    return {
      user: formattedUser,
      accessToken,
      refreshToken: session.token
    };
  }

  /**
   * Fetch current authenticated user by ID.
   */
  static async getUserById(userId: string): Promise<AuthUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: userIncludes
    });

    if (!user || user.status !== "Active") {
      throw new AuthError("User not found or inactive", 404);
    }

    return this.formatUserPayload(user);
  }

  /**
   * Logs out user by revoking session.
   */
  static async logout(sessionId?: string, userId?: string, clientIp?: string) {
    if (sessionId) {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isRevoked: true }
      }).catch(() => {});
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "Logout",
          ipAddress: clientIp || null
        }
      }).catch(() => {});
    }

    return { success: true };
  }

  /**
   * Formats user model to clean object excluding sensitive fields.
   */
  private static formatUserPayload(user: any): AuthUserResponse {
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

    // Process custom direct user permissions (grant or explicit revoke)
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

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
      requiresPasswordChange: !!user.requiresPasswordChange,
      status: user.status,
      permissions: Array.from(permissions),
      roles
    };
  }
}

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
