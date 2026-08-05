import { brandRepository } from "../src/api/repositories/brand.repository";

async function runTests() {
  console.log("Running Brand Repository Tests...");

  const testCode = `TEST_BRD_${Date.now()}`;
  const testName = `Test Brand ${Date.now()}`;

  // 1. Create brand
  const created = await brandRepository.create({
    code: testCode,
    name: testName,
    description: "Repository test brand description",
    logoUrl: "https://example.com/logo.png",
    website: "https://example.com",
    isActive: true,
  });

  if (!created || !created.id) {
    throw new Error("Failed to create brand in repository");
  }
  console.log("✓ [PASS] brandRepository.create - Created brand:", created.id);

  // 2. findById
  const foundById = await brandRepository.findById(created.id);
  if (!foundById || foundById.name !== testName) {
    throw new Error("brandRepository.findById failed");
  }
  console.log("✓ [PASS] brandRepository.findById - Found brand by ID");

  // 3. findByCode
  const foundByCode = await brandRepository.findByCode(testCode.toLowerCase());
  if (!foundByCode || foundByCode.id !== created.id) {
    throw new Error("brandRepository.findByCode failed");
  }
  console.log("✓ [PASS] brandRepository.findByCode - Found brand by case-insensitive code");

  // 4. findByName
  const foundByName = await brandRepository.findByName(testName.toLowerCase());
  if (!foundByName || foundByName.id !== created.id) {
    throw new Error("brandRepository.findByName failed");
  }
  console.log("✓ [PASS] brandRepository.findByName - Found brand by case-insensitive name");

  // 5. exists
  const exists = await brandRepository.exists(created.id);
  if (!exists) {
    throw new Error("brandRepository.exists returned false for created brand");
  }
  console.log("✓ [PASS] brandRepository.exists - Confirmed brand exists");

  // 6. findAll with search
  const searchResults = await brandRepository.findAll({
    search: testCode.substring(0, 10),
    page: 1,
    limit: 10,
    sortBy: "code",
    sortOrder: "asc",
  });
  if (!searchResults.data.some((b) => b.id === created.id)) {
    throw new Error("brandRepository.findAll with search failed");
  }
  console.log("✓ [PASS] brandRepository.findAll - Search, pagination & sorting worked");

  // 7. update
  const updatedName = `${testName} Updated`;
  const updated = await brandRepository.update(created.id, {
    name: updatedName,
  });
  if (!updated || updated.name !== updatedName) {
    throw new Error("brandRepository.update failed");
  }
  console.log("✓ [PASS] brandRepository.update - Updated brand name");

  // 8. soft delete
  await brandRepository.delete(created.id);
  const foundAfterDelete = await brandRepository.findById(created.id);
  if (foundAfterDelete !== null) {
    throw new Error("brandRepository.findById returned deleted brand");
  }
  console.log("✓ [PASS] brandRepository.delete - Soft deleted brand");

  console.log("==========================================");
  console.log("Brand Repository Tests: All Passed!");
  console.log("==========================================");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
