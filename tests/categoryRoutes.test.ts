import express, { Express } from "express";
import http from "http";
import categoryRoutes from "../src/api/v1/routes/category.routes";

async function runCategoryRouteTests() {
  console.log("==========================================");
  console.log("Running Category Routes Tests...");
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
      failed++;
    }
  };

  // Create an Express app instance for testing route mounting and middleware behavior
  const app: Express = express();
  app.use(express.json());

  // Dummy user injector middleware to simulate auth and RBAC
  app.use((req, res, next) => {
    if (req.headers["authorization"] === "Bearer valid-token") {
      req.user = {
        id: "usr-123",
        username: "admin",
        email: "admin@studioos.local",
        roles: ["admin"],
        permissions: ["category.view", "category.create", "category.update", "category.delete"],
      };
    } else if (req.headers["authorization"] === "Bearer viewer-token") {
      req.user = {
        id: "usr-456",
        username: "viewer",
        email: "viewer@studioos.local",
        roles: ["employee"],
        permissions: ["category.view"],
      };
    }
    next();
  });

  app.use("/api/v1/categories", categoryRoutes);

  // Test 1: Unauthenticated request returns 401
  await test("GET /api/v1/categories returns 401 when unauthenticated", async () => {
    const res = await fetchResponse(app, "GET", "/api/v1/categories");
    if (res.status !== 401) throw new Error(`Expected status 401, got ${res.status}`);
  });

  // Test 2: Authenticated request without create permission returns 403 on POST
  await test("POST /api/v1/categories returns 403 when user lacks permission", async () => {
    const res = await fetchResponse(app, "POST", "/api/v1/categories", {
      headers: { authorization: "Bearer viewer-token", "content-type": "application/json" },
      body: JSON.stringify({ name: "Test Category" }),
    });
    if (res.status !== 403) throw new Error(`Expected status 403, got ${res.status}`);
  });

  // Test 3: POST /api/v1/categories with invalid payload fails validation with 400
  await test("POST /api/v1/categories fails request validation middleware with 400", async () => {
    const res = await fetchResponse(app, "POST", "/api/v1/categories", {
      headers: { authorization: "Bearer valid-token", "content-type": "application/json" },
      body: JSON.stringify({ name: "" }), // empty name violates schema
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    const data = await res.json();
    if (data.error !== "Validation failed") throw new Error(`Unexpected error message: ${data.error}`);
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

/**
 * Lightweight helper to test express router in memory without opening a network port.
 */
function fetchResponse(app: Express, method: string, path: string, options: any = {}): Promise<any> {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", async () => {
      const address = server.address() as any;
      const url = `http://127.0.0.1:${address.port}${path}`;
      try {
        const response = await fetch(url, {
          method,
          headers: options.headers || {},
          body: options.body,
        });
        server.close();
        resolve(response);
      } catch (e) {
        server.close();
        resolve({ status: 500, json: async () => ({ error: (e as any).message }) });
      }
    });
  });
}

runCategoryRouteTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
