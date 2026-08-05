import { CreateBrandSchema, UpdateBrandSchema, BrandFilterSchema } from "../src/packages/validation/brand";

async function runTests() {
  console.log("Running Brand Validation Tests...");

  // 1. Valid Create Brand
  const validBrand = CreateBrandSchema.parse({
    code: "canon",
    name: "Canon Inc.",
    description: "Camera and optical products manufacturer",
    logoUrl: "https://example.com/logo.png",
    website: "https://www.canon.com",
    isActive: true,
  });

  if (validBrand.code !== "CANON") {
    throw new Error(`Expected uppercase code "CANON", got "${validBrand.code}"`);
  }
  console.log("✓ [PASS] CreateBrandSchema - Transforms code to uppercase");

  // 2. Invalid code length
  try {
    CreateBrandSchema.parse({
      code: "A".repeat(21),
      name: "Brand X",
    });
    throw new Error("Should have thrown validation error for code length > 20");
  } catch (err: any) {
    if (!err.message.includes("Brand code cannot exceed 20 characters")) {
      throw err;
    }
  }
  console.log("✓ [PASS] CreateBrandSchema - Code max 20 characters enforced");

  // 3. Invalid logoUrl
  try {
    CreateBrandSchema.parse({
      code: "NIKON",
      name: "Nikon",
      logoUrl: "not-a-valid-url",
    });
    throw new Error("Should have thrown validation error for invalid logoUrl");
  } catch (err: any) {
    if (!err.message.includes("Invalid Logo URL format")) {
      throw err;
    }
  }
  console.log("✓ [PASS] CreateBrandSchema - Logo URL validation enforced");

  // 4. Empty optional fields
  const emptyOptionals = CreateBrandSchema.parse({
    code: "SONY",
    name: "Sony",
    logoUrl: "",
    website: "",
    description: "",
  });
  if (emptyOptionals.code !== "SONY") {
    throw new Error("Failed parsing empty optional fields");
  }
  console.log("✓ [PASS] CreateBrandSchema - Optional empty strings handled");

  // 5. UpdateBrandSchema
  const partialUpdate = UpdateBrandSchema.parse({
    name: "Sony Corporation",
  });
  if (partialUpdate.name !== "Sony Corporation") {
    throw new Error("Partial update failed");
  }
  console.log("✓ [PASS] UpdateBrandSchema - Partial updates supported");

  // 6. BrandFilterSchema
  const filter = BrandFilterSchema.parse({
    page: "2",
    limit: "25",
    isActive: "true",
    sortBy: "code",
  });
  if (filter.page !== 2 || filter.limit !== 25 || filter.isActive !== true || filter.sortBy !== "code") {
    throw new Error(`Filter parsing mismatch: ${JSON.stringify(filter)}`);
  }
  console.log("✓ [PASS] BrandFilterSchema - Query param conversion supported");

  console.log("==========================================");
  console.log("Brand Validation Tests: All Passed!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
