import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "../src/packages/validation/category.validation";

async function runCategoryValidationTests() {
  console.log("==========================================");
  console.log("Running Category Validation Tests...");
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

  // 1. Valid Create Category Input
  test("Valid CreateCategoryInput succeeds and transforms code to uppercase", () => {
    const validData = {
      code: "photo-01",
      name: "Photography Services",
      description: "Studio photography sessions and prints",
      displayOrder: 1,
      isActive: true,
    };

    const result = createCategorySchema.parse(validData);
    if (result.code !== "PHOTO-01") {
      throw new Error(`Expected code to be PHOTO-01, got ${result.code}`);
    }
    if (result.name !== "Photography Services") {
      throw new Error("Name mismatch");
    }
    if (result.displayOrder !== 1) {
      throw new Error("displayOrder mismatch");
    }
    if (result.isActive !== true) {
      throw new Error("isActive mismatch");
    }
  });

  // 2. Default values for displayOrder and isActive
  test("Default values for displayOrder and isActive work", () => {
    const minimalData = {
      code: "PORTRAIT",
      name: "Portraits",
    };

    const result = createCategorySchema.parse(minimalData);
    if (result.displayOrder !== 0) {
      throw new Error(`Expected default displayOrder 0, got ${result.displayOrder}`);
    }
    if (result.isActive !== true) {
      throw new Error(`Expected default isActive true, got ${result.isActive}`);
    }
  });

  // 3. Code length constraints (2-20 chars)
  test("Code less than 2 characters fails validation", () => {
    try {
      createCategorySchema.parse({ code: "A", name: "Valid Name" });
      throw new Error("Should have thrown error for 1-char code");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  test("Code greater than 20 characters fails validation", () => {
    try {
      createCategorySchema.parse({ code: "THIS-CODE-IS-FAR-TOO-LONG", name: "Valid Name" });
      throw new Error("Should have thrown error for >20 char code");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  // 4. Code characters constraint (letters, numbers, hyphen only)
  test("Code with special characters fails regex validation", () => {
    try {
      createCategorySchema.parse({ code: "CAT_01!", name: "Valid Name" });
      throw new Error("Should have thrown error for invalid characters in code");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  // 5. Name length constraints (2-100 chars)
  test("Name less than 2 characters fails validation", () => {
    try {
      createCategorySchema.parse({ code: "CAT-01", name: "A" });
      throw new Error("Should have thrown error for 1-char name");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  test("Name > 100 characters fails validation", () => {
    try {
      createCategorySchema.parse({ code: "CAT-01", name: "N".repeat(101) });
      throw new Error("Should have thrown error for >100 char name");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  // 6. Description optional & max 500 chars
  test("Description > 500 characters fails validation", () => {
    try {
      createCategorySchema.parse({ code: "CAT-01", name: "Category Name", description: "D".repeat(501) });
      throw new Error("Should have thrown error for >500 char description");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  // 7. parentId UUID validation
  test("Valid parentId UUID succeeds", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";
    const result = createCategorySchema.parse({
      code: "SUB-01",
      name: "Subcategory",
      parentId: validUuid,
    });
    if (result.parentId !== validUuid) {
      throw new Error("parentId mismatch");
    }
  });

  test("Invalid parentId UUID fails validation", () => {
    try {
      createCategorySchema.parse({ code: "SUB-01", name: "Subcategory", parentId: "not-a-uuid" });
      throw new Error("Should have thrown error for invalid UUID parentId");
    } catch (err: any) {
      if (err.message.includes("Should have thrown")) throw err;
    }
  });

  // 8. Update Category Schema partial validation
  test("Update category allows partial input", () => {
    const updateInput = {
      name: "Updated Category Name",
    };
    const result = updateCategorySchema.parse(updateInput);
    if (result.name !== "Updated Category Name") {
      throw new Error("Update name mismatch");
    }
  });

  // 9. Query Validation
  test("Query schema parses parameters correctly", () => {
    const query = categoryQuerySchema.parse({
      page: "2",
      pageSize: "25",
      limit: "25",
      search: "portrait",
      isActive: "true",
      sortBy: "name",
      sortOrder: "desc",
    });

    if (query.page !== 2) throw new Error("page coercion failed");
    if (query.pageSize !== 25) throw new Error("pageSize coercion failed");
    if (query.isActive !== true) throw new Error("isActive coercion failed");
    if (query.sortBy !== "name") throw new Error("sortBy mismatch");
    if (query.sortOrder !== "desc") throw new Error("sortOrder mismatch");
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryValidationTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
