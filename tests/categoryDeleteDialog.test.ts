import { CategoryDeleteDialog } from "../src/web/components/categories/CategoryDeleteDialog";

function runCategoryDeleteDialogTests() {
  console.log("==========================================");
  console.log("Running Category Delete Dialog Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✓ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${message}`);
      failed++;
    }
  }

  // Test 1: CategoryDeleteDialog component export check
  assert(
    typeof CategoryDeleteDialog === "function",
    "CategoryDeleteDialog is exported as a functional component"
  );

  // Test 2: Component accepts props argument
  assert(
    CategoryDeleteDialog.length >= 1,
    "CategoryDeleteDialog accepts props interface"
  );

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryDeleteDialogTests();
