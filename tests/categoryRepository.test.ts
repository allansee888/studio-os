import { categoryRepository, CategoryRepository } from "../src/api/repositories/category.repository";

async function runCategoryRepositoryTests() {
  console.log("==========================================");
  console.log("Running Category Repository Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`❌ [FAIL] ${name} -> ERROR: ${err?.message || err}`);
      failed++;
    }
  };

  test("CategoryRepository instance exists", () => {
    if (!categoryRepository) {
      throw new Error("categoryRepository instance is missing");
    }
    if (!(categoryRepository instanceof CategoryRepository)) {
      throw new Error("categoryRepository is not an instance of CategoryRepository");
    }
  });

  test("Repository methods are defined", () => {
    const requiredMethods = [
      "findAll",
      "findById",
      "findByCode",
      "findChildren",
      "create",
      "update",
      "delete",
    ];

    for (const method of requiredMethods) {
      if (typeof (categoryRepository as any)[method] !== "function") {
        throw new Error(`Missing required method: ${method}`);
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

runCategoryRepositoryTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
