import { CategoryController } from "../src/api/controllers/category.controller";
import { CategoryError } from "../src/api/services/category.service";

// Mock Express Response
function createMockResponse() {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.body = data;
    return res;
  };
  return res;
}

async function runCategoryControllerTests() {
  console.log("==========================================");
  console.log("Running Category Controller Tests...");
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

  // Mock Category Service
  const mockService: any = {
    getCategories: async (query: any) => ({
      items: [{ id: "cat-1", name: "Mock Category", code: "MOCK-01" }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    }),
    getCategory: async (id: string) => {
      if (id === "not-found") throw new CategoryError("Category not found", 404);
      return { id, name: "Mock Category", code: "MOCK-01" };
    },
    createCategory: async (data: any, userId?: string) => ({
      id: "new-cat-id",
      ...data,
      createdBy: userId || null,
    }),
    updateCategory: async (id: string, data: any, userId?: string) => {
      if (id === "not-found") throw new CategoryError("Category not found", 404);
      return { id, ...data, updatedBy: userId || null };
    },
    deleteCategory: async (id: string, _userId?: string) => {
      if (id === "has-items") throw new CategoryError("Cannot delete category containing items", 400);
      return { message: "Category deleted successfully", id };
    },
  };

  const controller = new CategoryController(mockService);

  // Test 1: getCategories returns 200
  await test("getCategories returns 200 with items and pagination", async () => {
    const req: any = { query: { page: "1", pageSize: "10" } };
    const res = createMockResponse();

    await controller.getCategories(req, res);

    if (res.statusCode !== 200) throw new Error(`Expected status 200, got ${res.statusCode}`);
    if (!res.body.items || res.body.items.length !== 1) throw new Error("Items mismatch");
  });

  // Test 2: getCategory returns 200
  await test("getCategory returns 200 with category data", async () => {
    const req: any = { params: { id: "cat-1" } };
    const res = createMockResponse();

    await controller.getCategory(req, res);

    if (res.statusCode !== 200) throw new Error(`Expected status 200, got ${res.statusCode}`);
    if (res.body.data.id !== "cat-1") throw new Error("Category ID mismatch");
  });

  // Test 3: getCategory 404 handling
  await test("getCategory maps CategoryError 404 correctly", async () => {
    const req: any = { params: { id: "not-found" } };
    const res = createMockResponse();

    await controller.getCategory(req, res);

    if (res.statusCode !== 404) throw new Error(`Expected status 404, got ${res.statusCode}`);
    if (res.body.error !== "Category not found") throw new Error("Error message mismatch");
  });

  // Test 4: createCategory returns 201
  await test("createCategory validates body and returns 201", async () => {
    const req: any = {
      body: { code: "new-cat", name: "New Category Name" },
      user: { id: "user-123" },
    };
    const res = createMockResponse();

    await controller.createCategory(req, res);

    if (res.statusCode !== 201) throw new Error(`Expected status 201, got ${res.statusCode}`);
    if (res.body.data.code !== "NEW-CAT") throw new Error(`Expected upper transformed code NEW-CAT, got ${res.body.data.code}`);
    if (res.body.data.createdBy !== "user-123") throw new Error("CreatedBy mismatch");
  });

  // Test 5: createCategory handles Zod validation error
  await test("createCategory handles invalid body with 400 validation error", async () => {
    const req: any = {
      body: { code: "X", name: "" }, // invalid code & name
    };
    const res = createMockResponse();

    await controller.createCategory(req, res);

    if (res.statusCode !== 400) throw new Error(`Expected status 400, got ${res.statusCode}`);
    if (res.body.error !== "Validation failed") throw new Error("Error title mismatch");
    if (!Array.isArray(res.body.details)) throw new Error("Expected details array");
  });

  // Test 6: updateCategory returns 200
  await test("updateCategory updates category and returns 200", async () => {
    const req: any = {
      params: { id: "cat-1" },
      body: { name: "Updated Category Name" },
      user: { id: "user-456" },
    };
    const res = createMockResponse();

    await controller.updateCategory(req, res);

    if (res.statusCode !== 200) throw new Error(`Expected status 200, got ${res.statusCode}`);
    if (res.body.data.name !== "Updated Category Name") throw new Error("Updated name mismatch");
  });

  // Test 7: deleteCategory returns 200
  await test("deleteCategory soft deletes and returns 200", async () => {
    const req: any = { params: { id: "cat-1" }, user: { id: "user-123" } };
    const res = createMockResponse();

    await controller.deleteCategory(req, res);

    if (res.statusCode !== 200) throw new Error(`Expected status 200, got ${res.statusCode}`);
    if (res.body.id !== "cat-1") throw new Error("Deleted ID mismatch");
  });

  // Test 8: deleteCategory returns 400 on business rule failure
  await test("deleteCategory returns 400 when business validation fails", async () => {
    const req: any = { params: { id: "has-items" } };
    const res = createMockResponse();

    await controller.deleteCategory(req, res);

    if (res.statusCode !== 400) throw new Error(`Expected status 400, got ${res.statusCode}`);
    if (!res.body.error.includes("items")) throw new Error("Error message mismatch");
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryControllerTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
