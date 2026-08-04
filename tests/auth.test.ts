import { AuthService, AuthError } from "../src/api/services/authService";
import { prisma } from "../src/db/prisma";
import jwt from "jsonwebtoken";
import { config } from "../src/config/index";

async function runAuthTests() {
  console.log("==========================================");
  console.log("Running Authentication Module Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`❌ [FAIL] ${name} -> ERROR: ${err?.message || err}`);
      if (err?.stack) console.log(err.stack);
      failed++;
    }
  };

  // 1. Database Connection check
  await test("Database Connection & Schema Verification", async () => {
    const count = await prisma.user.count();
    if (typeof count !== "number") throw new Error("Database query failed");
  });

  // 2. Admin user presence check
  let adminUserId = "";
  await test("Default Administrator Account Exists", async () => {
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: "admin" }, { email: "admin@studio.os" }],
      },
    });

    if (!adminUser) {
      throw new Error("Admin account was not found in database. Run seed script first.");
    }
    if (adminUser.status !== "Active") {
      throw new Error("Admin account is not Active");
    }
    adminUserId = adminUser.id;
  });

  // 3. Login with username
  let refresh1 = "";
  let access1 = "";
  await test("Login using Username (admin / admin123)", async () => {
    const result = await AuthService.login(
      { identifier: "admin", password: "admin123", rememberMe: false },
      "127.0.0.1",
      "test-agent"
    );

    if (!result.accessToken || !result.refreshToken) {
      throw new Error("Tokens were not generated upon login");
    }
    if (result.user.email !== "admin@studio.os") {
      throw new Error("Returned user email mismatch");
    }
    access1 = result.accessToken;
    refresh1 = result.refreshToken;
  });

  // 4. Login with email
  await test("Login using Email (admin@studio.os / admin123)", async () => {
    const result = await AuthService.login(
      { identifier: "admin@studio.os", password: "admin123", rememberMe: false },
      "127.0.0.1",
      "test-agent"
    );

    if (!result.accessToken || !result.refreshToken) {
      throw new Error("Tokens were not generated upon login with email");
    }
    if (result.user.username !== "admin") {
      throw new Error("Returned user username mismatch");
    }
  });

  // 5. Invalid credentials check
  await test("Reject Login with Incorrect Password", async () => {
    try {
      await AuthService.login(
        { identifier: "admin", password: "wrongpassword", rememberMe: false },
        "127.0.0.1",
        "test-agent"
      );
      throw new Error("Should have thrown error on wrong password");
    } catch (err: any) {
      if (err instanceof AuthError && err.statusCode === 401) {
        // Expected
      } else if (err.message.includes("Should have thrown")) {
        throw err;
      }
    }
  });

  // 6. JWT Generation & Verification
  await test("Verify JWT Payload and Secret", async () => {
    const decoded = jwt.verify(access1, config.JWT_SECRET) as any;
    if (decoded.userId !== adminUserId) {
      throw new Error("Decoded JWT userId mismatch");
    }
    if (!decoded.sessionId) {
      throw new Error("JWT does not contain sessionId");
    }
  });

  // 7. Refresh Token Flow
  let newAccess = "";
  await test("Token Refresh Flow", async () => {
    const result = await AuthService.refresh(refresh1, "127.0.0.1", "test-agent");
    if (!result.accessToken) {
      throw new Error("Failed to issue new access token on refresh");
    }
    if (result.user.id !== adminUserId) {
      throw new Error("Refreshed user ID mismatch");
    }
    newAccess = result.accessToken;
  });

  // 8. Session Revocation / Logout
  await test("Logout & Session Revocation Flow", async () => {
    const decoded = jwt.verify(newAccess, config.JWT_SECRET) as any;
    const sessionId = decoded.sessionId;

    await AuthService.logout(sessionId, adminUserId, "127.0.0.1");

    // Try refreshing with the revoked token session
    try {
      await AuthService.refresh(refresh1, "127.0.0.1", "test-agent");
      throw new Error("Should have blocked refresh with revoked session");
    } catch (err: any) {
      if (err instanceof AuthError && err.statusCode === 401) {
        // Expected
      } else if (err.message.includes("Should have blocked")) {
        throw err;
      }
    }
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
