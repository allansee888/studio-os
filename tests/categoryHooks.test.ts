import { categoryApi } from "../src/web/api/category.api";
import { categoryKeys, useCategories, useCategory, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../src/web/hooks/category.hooks";

async function runCategoryHooksTests() {
  console.log("==========================================");
  console.log("Running Category API Client & Hooks Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const test = (name: string, fn: () => void | Promise<void>) => {
    try {
      const res = fn();
      if (res && typeof res.then === "function") {
        return res.then(() => {
          console.log(`✓ [PASS] ${name}`);
          passed++;
        }).catch((err: any) => {
          console.log(`❌ [FAIL] ${name} -> ERROR: ${err?.message || err}`);
          failed++;
        });
      } else {
        console.log(`✓ [PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.log(`❌ [FAIL] ${name} -> ERROR: ${err?.message || err}`);
      failed++;
    }
  };

  // Test 1: Category Query Keys structure
  test("categoryKeys generates correct key structures", () => {
    if (JSON.stringify(categoryKeys.all) !== JSON.stringify(["categories"])) {
      throw new Error("categoryKeys.all failed");
    }
    const listKey = categoryKeys.list({ page: 1, limit: 10, search: "photo" });
    if (listKey[0] !== "categories" || listKey[1] !== "list") {
      throw new Error("categoryKeys.list prefix failed");
    }
    const detailKey = categoryKeys.detail("cat-123");
    if (JSON.stringify(detailKey) !== JSON.stringify(["categories", "detail", "cat-123"])) {
      throw new Error("categoryKeys.detail failed");
    }
  });

  // Test 2: Category API object method signatures
  test("categoryApi exposes required interface methods", () => {
    if (typeof categoryApi.getCategories !== "function") throw new Error("getCategories missing");
    if (typeof categoryApi.getCategory !== "function") throw new Error("getCategory missing");
    if (typeof categoryApi.createCategory !== "function") throw new Error("createCategory missing");
    if (typeof categoryApi.updateCategory !== "function") throw new Error("updateCategory missing");
    if (typeof categoryApi.deleteCategory !== "function") throw new Error("deleteCategory missing");
  });

  // Test 3: React Query hooks exports
  test("Category hooks are exported as functions", () => {
    if (typeof useCategories !== "function") throw new Error("useCategories missing");
    if (typeof useCategory !== "function") throw new Error("useCategory missing");
    if (typeof useCreateCategory !== "function") throw new Error("useCreateCategory missing");
    if (typeof useUpdateCategory !== "function") throw new Error("useUpdateCategory missing");
    if (typeof useDeleteCategory !== "function") throw new Error("useDeleteCategory missing");
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryHooksTests();
