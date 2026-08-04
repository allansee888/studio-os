import { CategoryService, CategoryError } from "../src/api/services/category.service";
import { CategoryRepository } from "../src/api/repositories/category.repository";

// Mock CategoryRepository for testing CategoryService business rules in isolation
class MockCategoryRepository extends CategoryRepository {
  public categories: any[] = [];

  async findById(id: string) {
    const cat = this.categories.find((c) => c.id === id && !c.deletedAt);
    if (!cat) return null;
    return {
      ...cat,
      _count: {
        children: this.categories.filter((c) => c.parentCategoryId === id && !c.deletedAt).length,
        items: cat.itemsCount || 0,
      },
    } as any;
  }

  async findByCode(code: string) {
    const cat = this.categories.find((c) => c.code === code && !c.deletedAt);
    return cat || null;
  }

  async findChildren(parentId: string | null) {
    return this.categories.filter((c) => c.parentCategoryId === parentId && !c.deletedAt) as any[];
  }

  async findAll(_filters: any = {}) {
    const active = this.categories.filter((c) => !c.deletedAt);
    return {
      data: active,
      total: active.length,
      page: 1,
      limit: 10,
      totalPages: 1,
    } as any;
  }

  async create(data: any) {
    const newCat = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: data.code,
      name: data.name,
      description: data.description || null,
      parentCategoryId: data.parentCategoryId || null,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy || null,
      updatedBy: null,
      deletedAt: null,
    };
    this.categories.push(newCat);
    return newCat as any;
  }

  async update(id: string, data: any) {
    const index = this.categories.findIndex((c) => c.id === id && !c.deletedAt);
    if (index === -1) throw new Error("Not found");
    const existing = this.categories[index];
    const updated = {
      ...existing,
      ...data,
      parentCategoryId: data.parentCategoryId !== undefined ? data.parentCategoryId : existing.parentCategoryId,
      updatedAt: new Date(),
    };
    this.categories[index] = updated;
    return updated as any;
  }

  async delete(id: string) {
    const cat = this.categories.find((c) => c.id === id);
    if (cat) cat.deletedAt = new Date();
    return cat as any;
  }
}

async function runCategoryServiceTests() {
  console.log("==========================================");
  console.log("Running Category Service Business Logic Tests...");
  console.log("==========================================");

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.log(`❌ [FAIL] ${name} -> ERROR: ${err?.message || err}`);
      failed++;
    }
  };

  // Test 1: Code Uniqueness on Create
  await test("Create Category throws error if code is not unique", async () => {
    const mockRepo = new MockCategoryRepository();
    mockRepo.categories.push({
      id: "cat-1",
      code: "PHOTO",
      name: "Photography",
      deletedAt: null,
    });
    const service = new CategoryService(mockRepo);

    try {
      await service.createCategory({ code: "photo", name: "Photo Copy", displayOrder: 0, isActive: true });
      throw new Error("Should have thrown error for duplicate code");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("already exists")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 2: Non-existent Parent Category on Create
  await test("Create Category throws error if parent category does not exist", async () => {
    const mockRepo = new MockCategoryRepository();
    const service = new CategoryService(mockRepo);

    try {
      await service.createCategory({
        code: "SUB-01",
        name: "Subcategory",
        parentId: "123e4567-e89b-12d3-a456-426614174000",
        displayOrder: 0,
        isActive: true,
      });
      throw new Error("Should have thrown error for non-existent parent");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("does not exist")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 3: Self-parenting on Update
  await test("Update Category prevents assigning self as parent", async () => {
    const mockRepo = new MockCategoryRepository();
    const catId = "123e4567-e89b-12d3-a456-426614174000";
    mockRepo.categories.push({
      id: catId,
      code: "PORTRAIT",
      name: "Portrait",
      deletedAt: null,
    });
    const service = new CategoryService(mockRepo);

    try {
      await service.updateCategory(catId, { parentId: catId });
      throw new Error("Should have thrown error for self parenting");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("own parent")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 4: Circular Parent Relationship on Update
  await test("Update Category prevents circular parent relationship (A -> B -> A)", async () => {
    const mockRepo = new MockCategoryRepository();
    const catA = "11111111-1111-4111-8111-111111111111";
    const catB = "22222222-2222-4222-8222-222222222222";

    mockRepo.categories.push(
      { id: catA, code: "CAT-A", name: "Category A", parentCategoryId: null, deletedAt: null },
      { id: catB, code: "CAT-B", name: "Category B", parentCategoryId: catA, deletedAt: null }
    );
    const service = new CategoryService(mockRepo);

    try {
      await service.updateCategory(catA, { parentId: catB });
      throw new Error("Should have thrown error for circular parent relationship");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("Circular parent")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 5: Delete Category prevents deletion if subcategories exist
  await test("Delete Category fails if child categories exist", async () => {
    const mockRepo = new MockCategoryRepository();
    const parentId = "11111111-1111-4111-8111-111111111111";
    const childId = "22222222-2222-4222-8222-222222222222";

    mockRepo.categories.push(
      { id: parentId, code: "PARENT", name: "Parent Category", parentCategoryId: null, deletedAt: null },
      { id: childId, code: "CHILD", name: "Child Category", parentCategoryId: parentId, deletedAt: null }
    );
    const service = new CategoryService(mockRepo);

    try {
      await service.deleteCategory(parentId);
      throw new Error("Should have thrown error for deleting category with children");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("subcategory")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 6: Delete Category fails if catalog items exist
  await test("Delete Category fails if catalog items exist", async () => {
    const mockRepo = new MockCategoryRepository();
    const catId = "11111111-1111-4111-8111-111111111111";

    mockRepo.categories.push({
      id: catId,
      code: "ITEMS-CAT",
      name: "Category With Items",
      parentCategoryId: null,
      deletedAt: null,
      itemsCount: 5,
    });
    const service = new CategoryService(mockRepo);

    try {
      await service.deleteCategory(catId);
      throw new Error("Should have thrown error for deleting category with catalog items");
    } catch (err: any) {
      if (!(err instanceof CategoryError) || !err.message.includes("catalog items")) {
        throw new Error(`Unexpected error: ${err.message}`);
      }
    }
  });

  // Test 7: Successful Delete when no subcategories or items exist
  await test("Delete Category succeeds when clean", async () => {
    const mockRepo = new MockCategoryRepository();
    const catId = "11111111-1111-4111-8111-111111111111";

    mockRepo.categories.push({
      id: catId,
      code: "CLEAN-CAT",
      name: "Clean Category",
      parentCategoryId: null,
      deletedAt: null,
      itemsCount: 0,
    });
    const service = new CategoryService(mockRepo);

    const result = await service.deleteCategory(catId);
    if (result.id !== catId) {
      throw new Error("Delete result ID mismatch");
    }
  });

  console.log("==========================================");
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log("==========================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runCategoryServiceTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
