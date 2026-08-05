import { uomService, UomService, UomError } from "../src/api/services/uomService";
import { createUomSchema, updateUomSchema } from "../src/packages/validation/uom";
import { prisma } from "../src/db/prisma";

async function runTests() {
  console.log("==========================================");
  console.log("Running Unit of Measure (UOM) Module Tests...");
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

  // 1. Validation tests
  await test("Create UOM Validation - Valid Input", async () => {
    const result = createUomSchema.parse({
      name: "Carton",
      abbreviation: "ctn",
      code: "UOM-CTN",
      displayOrder: 1,
      isActive: true,
    });
    if (result.name !== "Carton" || result.abbreviation !== "ctn") {
      throw new Error("Validation input mismatch");
    }
  });

  await test("Create UOM Validation - Missing Abbreviation should fail", async () => {
    try {
      createUomSchema.parse({ name: "Kilogram", code: "UOM-KG" });
      throw new Error("Should have failed validation due to missing abbreviation");
    } catch (e: any) {
      if (e.message.includes("Should have failed")) throw e;
    }
  });

  // 2. Service test: Create UOM
  let uom1Id: string = "";
  let uom2Id: string = "";
  const timestamp = Date.now().toString().slice(-4);
  const testCode1 = `UOM-TEST-${timestamp}`;

  await test("uomService.createUnit - Create Unit with Explicit Code", async () => {
    const unit = await uomService.createUnit({
      name: `Test Gallon ${timestamp}`,
      abbreviation: `gal${timestamp}`,
      code: testCode1,
      displayOrder: 10,
      isActive: true,
    });
    if (!unit.id || unit.code !== testCode1) throw new Error("UOM creation failed");
    uom1Id = unit.id;
  });

  await test("uomService.createUnit - Auto Generate Code when Blank", async () => {
    const unit = await uomService.createUnit({
      name: `Test Liter ${timestamp}`,
      abbreviation: `ltr${timestamp}`,
      displayOrder: 2,
      isActive: true,
    });
    if (!unit.id || !unit.code.startsWith("UOM-")) throw new Error("UOM auto-code generation failed");
    uom2Id = unit.id;
  });

  // 3. Service test: Code Uniqueness
  await test("uomService.createUnit - Block Duplicate Code", async () => {
    try {
      await uomService.createUnit({
        name: `Duplicate Code Unit ${Date.now()}`,
        abbreviation: `dc${Date.now().toString().slice(-4)}`,
        code: testCode1,
        displayOrder: 1,
        isActive: true,
      });
      throw new Error("Should have blocked duplicate code");
    } catch (err: any) {
      if (err instanceof UomError && err.message.includes("already exists")) {
        // Expected
      } else if (err.message.includes("Should have blocked")) {
        throw err;
      }
    }
  });

  // 4. Service test: Update UOM
  await test("uomService.updateUnit - Update Name and Abbreviation", async () => {
    const updated = await uomService.updateUnit(uom1Id, {
      name: `Test Gallon Updated ${timestamp}`,
      abbreviation: `gal-upd-${timestamp}`,
    });
    if (updated.name !== `Test Gallon Updated ${timestamp}` || updated.abbreviation !== `GAL-UPD-${timestamp}`) {
      throw new Error("UOM update failed");
    }
  });

  // 5. Service test: Reference Safeguard Deletion Protection
  let testItemId: string = "";
  await test("uomService.deleteUnit - Prevent Deletion when Referenced by Catalog Item", async () => {
    // Create a temporary CatalogItem linked to uom1Id
    const item = await prisma.catalogItem.create({
      data: {
        sku: `SKU-TEST-${Date.now()}`,
        name: "Test Item with UOM",
        itemType: "PHYSICAL_PRODUCT",
        price: 19.99,
        uomId: uom1Id,
      },
    });
    testItemId = item.id;

    try {
      await uomService.deleteUnit(uom1Id);
      throw new Error("Should have blocked deletion of referenced UOM");
    } catch (err: any) {
      if (err instanceof UomError && err.message.includes("referenced by")) {
        // Expected
      } else if (err.message.includes("Should have blocked")) {
        throw err;
      }
    } finally {
      // Clean up catalog item
      if (testItemId) {
        await prisma.catalogItem.delete({ where: { id: testItemId } });
      }
    }
  });

  // 6. Service test: Soft Delete
  await test("uomService.deleteUnit - Soft Delete UOM", async () => {
    const deleted = await uomService.deleteUnit(uom1Id);
    if (!deleted.id) throw new Error("Soft delete failed");

    // Verify soft delete in DB
    const dbItem = await prisma.unitOfMeasure.findUnique({ where: { id: uom1Id } });
    if (!dbItem || !dbItem.deletedAt) throw new Error("UOM deletedAt timestamp was not set");
  });

  // 7. Cleanup second test UOM
  await test("Cleanup Second Test UOM", async () => {
    await uomService.deleteUnit(uom2Id);
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
