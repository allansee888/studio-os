import { CategoryService, CategoryError } from "../src/api/services/categoryService";
import { createCategorySchema, updateCategorySchema } from "../src/packages/validation/category";
import { prisma } from "../src/db/prisma";

async function runTests() {
  console.log("==========================================");
  console.log("Running Category Module Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`✗ [FAIL] ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  };

  // 1. Validation test
  await test("Create Category Validation - Valid Input", async () => {
    const result = createCategorySchema.parse({
      name: "Photo Printing",
      code: "CAT-TEST-01",
      displayOrder: 1,
      isActive: true,
    });
    if (result.name !== "Photo Printing") throw new Error("Name mismatch");
  });

  await test("Create Category Validation - Missing Name should fail", async () => {
    try {
      createCategorySchema.parse({ code: "CAT-TEST-02" });
      throw new Error("Should have failed validation");
    } catch (e: any) {
      if (e.message.includes("Should have failed")) throw e;
    }
  });

  // 2. Service test: Create Category
  let cat1Id: string = "";
  let cat2Id: string = "";

  await test("CategoryService.createCategory - Create Root Category", async () => {
    const cat = await CategoryService.createCategory({
      name: "Test Root Category",
      code: `CAT-TEST-ROOT-${Date.now()}`,
      displayOrder: 10,
      isActive: true,
    });
    if (!cat.id || !cat.code) throw new Error("Category creation failed");
    cat1Id = cat.id;
  });

  await test("CategoryService.createCategory - Create Child Category", async () => {
    const cat = await CategoryService.createCategory({
      name: "Test Sub Category",
      code: `CAT-TEST-SUB-${Date.now()}`,
      parentCategoryId: cat1Id,
      displayOrder: 1,
      isActive: true,
    });
    if (cat.parentCategoryId !== cat1Id) throw new Error("Parent category ID mismatch");
    cat2Id = cat.id;
  });

  // 3. Service test: Circular relationship prevention
  await test("CategoryService.updateCategory - Prevent Circular Parent Relation", async () => {
    try {
      // Trying to set root category's parent to its own child
      await CategoryService.updateCategory(cat1Id, {
        parentCategoryId: cat2Id,
      });
      throw new Error("Should have blocked circular parent relationship");
    } catch (err: any) {
      if (err instanceof CategoryError && err.message.includes("Circular")) {
        // Expected
      } else if (err.message.includes("Should have blocked")) {
        throw err;
      }
    }
  });

  // 4. Service test: Soft Delete
  await test("CategoryService.deleteCategory - Soft Delete Child Category", async () => {
    const result = await CategoryService.deleteCategory(cat2Id);
    if (!result.id) throw new Error("Delete failed");

    // Verify soft delete in prisma
    const dbItem = await prisma.category.findUnique({ where: { id: cat2Id } });
    if (!dbItem || !dbItem.deletedAt) throw new Error("Category deletedAt timestamp not set");
  });

  // 5. Clean up root test category
  await test("Cleanup Root Test Category", async () => {
    await CategoryService.deleteCategory(cat1Id);
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
