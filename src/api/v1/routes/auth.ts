import { Router } from "express";
import { ZodError } from "zod";
import { AuthService, AuthError } from "../../services/authService";
import { authenticate } from "../../middlewares/auth";
import { loginSchema } from "../../../packages/validation/auth";
import { config } from "../../../config/index";

const router = Router();

/**
 * POST /api/v1/auth/login
 * Support login using email or username, bcrypt password validation, JWT generation.
 */
router.post("/login", async (req, res) => {
  try {
    const input = loginSchema.parse(req.body);
    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    const result = await AuthService.login(input, clientIp, userAgent);

    // Set HTTP-only cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000 // 1 hour
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: result.expiresAt.getTime() - Date.now()
    });

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((e) => e.message)
      });
    }

    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token.
 */
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const clientIp = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is required" });
    }

    const result = await AuthService.refresh(refreshToken, clientIp, userAgent);

    // Update access token cookie
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3600000 // 1 hour
    });

    res.json({
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (error: any) {
    // Clear cookies if refresh fails
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

/**
 * POST /api/v1/auth/logout
 * Revoke session and clear authentication cookies.
 */
router.post("/logout", async (req, res) => {
  try {
    const sessionId = req.session?.id;
    const userId = req.user?.id;
    const clientIp = req.ip || req.socket.remoteAddress;

    await AuthService.logout(sessionId, userId, clientIp);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/v1/auth/me
 * Returns the current authenticated user session details.
 */
router.get("/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
