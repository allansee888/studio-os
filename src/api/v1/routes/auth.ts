import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db/prisma";
import { authenticate } from "../../middlewares/auth";
import { config } from "../../../config/index";

const router = Router();
const JWT_SECRET = config.JWT_SECRET;

router.post("/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: { include: { rolePermissions: { include: { permission: true } } } } }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.status !== "Active") {
      return res.status(401).json({ error: `Account is ${user.status.toLowerCase()}` });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return res.status(401).json({ error: "Account is locked due to too many failed attempts" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      const failedLogins = user.failedLogins + 1;
      const lockedUntil = failedLogins >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLogins, lockedUntil }
      });

      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Reset failed logins
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLogin: new Date() }
    });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 1));

    const tokenPayload = { userId: user.id };
    const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: rememberMe ? "30d" : "1d" });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        ipAddress: req.ip || req.socket.remoteAddress,
        browser: req.headers["user-agent"],
        expiresAt
      }
    });

    // Log the login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "Login",
        ipAddress: req.ip || req.socket.remoteAddress
      }
    });

    const accessToken = jwt.sign({ userId: user.id, sessionId: session.id }, JWT_SECRET, { expiresIn: "1h" });

    // Permissions
    const permissions = new Set<string>();
    user.userRoles.forEach(ur => ur.role.rolePermissions.forEach(rp => permissions.add(rp.permission.name)));

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      requiresPasswordChange: user.requiresPasswordChange,
      permissions: Array.from(permissions)
    };

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 // 1 hour
    });

    res.json({ user: userData, accessToken });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", authenticate, async (req, res) => {
  try {
    if (req.session) {
      await prisma.session.update({
        where: { id: req.session.id },
        data: { isRevoked: true }
      });
    }

    if (req.user) {
      await prisma.auditLog.create({
        data: {
          userId: req.user.id,
          action: "Logout",
          ipAddress: req.ip || req.socket.remoteAddress
        }
      });
    }

    res.clearCookie("accessToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  const { passwordHash, ...userData } = req.user;
  res.json({ user: userData });
});

export default router;
