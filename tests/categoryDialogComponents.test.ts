import { CategoryDialog } from "../src/web/components/categories/CategoryDialog";
import { CategoryForm } from "../src/web/components/categories/CategoryForm";

function runCategoryComponentTests() {
  console.log("==========================================");
  console.log("Running Category Dialog & Form Component Tests...");
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

  // Test 1: Components are properly exported
  assert(typeof CategoryDialog === "function", "CategoryDialog is exported as a functional component");
  assert(typeof CategoryForm === "function", "CategoryForm is exported as a functional component");

  // Test 2: CategoryForm schema and props interface checks
  assert(CategoryForm.length >= 1, "CategoryForm accepts props argument");
  assert(CategoryDialog.length >= 1, "CategoryDialog accepts props argument");

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryComponentTests();
