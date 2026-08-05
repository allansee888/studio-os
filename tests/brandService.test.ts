import { brandService, BrandError } from "../src/api/services/brand.service";

async function runTests() {
  console.log("Running Brand Service Tests...");

  const testCode = `B_${Date.now().toString().slice(-12)}`;
  const testName = `Service Brand ${Date.now()}`;

  // 1. Create brand with lowercase code to test uppercase normalization
  const created = await brandService.createBrand({
    code: testCode.toLowerCase(),
    name: testName,
    description: "Service test brand description",
    logoUrl: "https://example.com/logo.jpg",
    website: "https://example.com",
    isActive: true,
  });

  if (!created || !created.id) {
    throw new Error("Failed to create brand in BrandService");
  }
  if (created.code !== testCode.toUpperCase()) {
    throw new Error(`Expected uppercase code '${testCode.toUpperCase()}', got '${created.code}'`);
  }
  console.log("✓ [PASS] brandService.createBrand - Uppercase code normalization & creation worked");

  // 2. Prevent duplicate code
  try {
    await brandService.createBrand({
      code: testCode,
      name: `Different Name ${Date.now()}`,
    });
    throw new Error("Should have thrown BrandError for duplicate code");
  } catch (err: any) {
    if (!(err instanceof BrandError) || !err.message.includes("already exists")) {
      throw err;
    }
  }
  console.log("✓ [PASS] brandService.createBrand - Duplicate code prevented");

  // 3. Prevent duplicate name
  try {
    await brandService.createBrand({
      code: `UNIQUE_${Date.now()}`,
      name: testName,
    });
    throw new Error("Should have thrown BrandError for duplicate name");
  } catch (err: any) {
    if (!(err instanceof BrandError) || !err.message.includes("already exists")) {
      throw err;
    }
  }
  console.log("✓ [PASS] brandService.createBrand - Duplicate name prevented");

  // 4. Invalid logoUrl format
  try {
    await brandService.createBrand({
      code: `U_${Date.now().toString().slice(-12)}`,
      name: `URL Test ${Date.now()}`,
      logoUrl: "invalid-url",
    });
    throw new Error("Should have thrown BrandError for invalid logoUrl");
  } catch (err: any) {
    if (!(err instanceof BrandError) || !err.message.includes("Invalid Logo URL format")) {
      throw err;
    }
  }
  console.log("✓ [PASS] brandService.createBrand - Invalid Logo URL prevented");

  // 5. getBrands list, search and pagination
  const listResult = await brandService.getBrands({
    search: testCode,
    page: 1,
    limit: 10,
  });
  if (!listResult.items || listResult.items.length === 0) {
    throw new Error("brandService.getBrands failed to return created brand");
  }
  console.log("✓ [PASS] brandService.getBrands - List & search pagination works");

  // 6. getBrand by ID
  const fetched = await brandService.getBrand(created.id);
  if (!fetched || fetched.id !== created.id) {
    throw new Error("brandService.getBrand failed");
  }
  console.log("✓ [PASS] brandService.getBrand - Found brand by ID");

  // 7. updateBrand - duplicate code check
  const secondCode = `B2_${Date.now().toString().slice(-12)}`;
  const secondBrand = await brandService.createBrand({
    code: secondCode,
    name: `Second Brand ${Date.now()}`,
  });

  try {
    await brandService.updateBrand(secondBrand.id, {
      code: testCode, // Existing brand 1 code
    });
    throw new Error("Should have thrown BrandError for duplicate code on update");
  } catch (err: any) {
    if (!(err instanceof BrandError) || !err.message.includes("already exists")) {
      throw err;
    }
  }
  console.log("✓ [PASS] brandService.updateBrand - Duplicate code on update prevented");

  // 8. updateBrand - successful update
  const updatedName = `${testName} Updated`;
  const updated = await brandService.updateBrand(created.id, {
    name: updatedName,
    website: "https://updated-domain.com",
  });
  if (updated.name !== updatedName || updated.website !== "https://updated-domain.com") {
    throw new Error("brandService.updateBrand failed to update fields");
  }
  console.log("✓ [PASS] brandService.updateBrand - Brand updated successfully");

  // 9. deleteBrand
  await brandService.deleteBrand(created.id);
  await brandService.deleteBrand(secondBrand.id);

  try {
    await brandService.getBrand(created.id);
    throw new Error("Should have thrown 404 for deleted brand");
  } catch (err: any) {
    if (!(err instanceof BrandError) || err.statusCode !== 404) {
      throw err;
    }
  }
  console.log("✓ [PASS] brandService.deleteBrand - Brand deleted successfully");

  console.log("==========================================");
  console.log("Brand Service Tests: All Passed!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
