import { categoryRepository, CategoryRepository, CategoryFilters } from "../repositories/category.repository";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../packages/validation/category.validation";

export class CategoryError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CategoryError";
    this.statusCode = statusCode;
  }
}

export class CategoryService {
  private repository: CategoryRepository;

  constructor(repository: CategoryRepository = categoryRepository) {
    this.repository = repository;
  }

  // --- Static wrapper methods for backward compatibility & easy static access ---
  static async getCategories(query: Record<string, unknown> = {}) {
    return categoryService.getCategories(query);
  }

  static async getCategoryTree(isActiveOnly?: boolean) {
    return categoryService.getCategoryTree(isActiveOnly);
  }

  static async getCategory(id: string) {
    return categoryService.getCategory(id);
  }

  static async getCategoryById(id: string) {
    return categoryService.getCategoryById(id);
  }

  static async createCategory(data: CreateCategoryInput, userId?: string) {
    return categoryService.createCategory(data, userId);
  }

  static async updateCategory(id: string, data: UpdateCategoryInput, userId?: string) {
    return categoryService.updateCategory(id, data, userId);
  }

  static async deleteCategory(id: string, userId?: string) {
    return categoryService.deleteCategory(id, userId);
  }

  /**
   * Helper to check for circular parent-child relationships.
   */
  private async checkCircularRelation(categoryId: string, targetParentId: string): Promise<void> {
    if (categoryId === targetParentId) {
      throw new CategoryError("A category cannot be its own parent category", 400);
    }

    let currentParentId: string | null = targetParentId;
    const visited = new Set<string>([categoryId]);

    while (currentParentId) {
      if (visited.has(currentParentId)) {
        throw new CategoryError("Circular parent category relationship detected", 400);
      }
      visited.add(currentParentId);

      const parent = await this.repository.findById(currentParentId);
      if (!parent) break;
      currentParentId = parent.parentCategoryId;
    }
  }

  /**
   * Helper to auto-generate a category code if none provided.
   */
  private async generateCategoryCode(name: string): Promise<string> {
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase() || "CAT";

    const allCategories = await this.repository.findAll({ limit: 10000 });
    const candidate = `${prefix}-${String(allCategories.total + 1).padStart(4, "0")}`;

    const existing = await this.repository.findByCode(candidate);
    if (!existing) {
      return candidate;
    }
    return `CAT-${Date.now().toString().slice(-6)}`;
  }

  /**
   * Get paginated categories or category tree.
   */
  async getCategories(query: Record<string, unknown> = {}) {
    const validatedQuery = categoryQuerySchema.parse(query);

    if (validatedQuery.tree) {
      return this.getCategoryTree(validatedQuery.isActive);
    }

    const filters: CategoryFilters = {
      page: validatedQuery.page,
      limit: validatedQuery.limit || validatedQuery.pageSize,
      pageSize: validatedQuery.pageSize,
      search: validatedQuery.search,
      isActive: validatedQuery.isActive,
      parentId: validatedQuery.parentId ?? validatedQuery.parentCategoryId,
      sortBy: validatedQuery.sortBy,
      sortOrder: validatedQuery.sortOrder,
      includeParent: true,
      includeItemsCount: true,
    };

    const result = await this.repository.findAll(filters);

    return {
      items: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get category tree structure.
   */
  async getCategoryTree(isActiveOnly?: boolean) {
    const result = await this.repository.findAll({
      limit: 1000,
      isActive: isActiveOnly,
      includeItemsCount: true,
    });

    const categoryMap = new Map<string, any>();
    result.data.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootNodes: any[] = [];
    result.data.forEach((cat) => {
      const node = categoryMap.get(cat.id);
      if (cat.parentCategoryId && categoryMap.has(cat.parentCategoryId)) {
        categoryMap.get(cat.parentCategoryId).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  /**
   * Get category by ID.
   */
  async getCategory(id: string) {
    const category = await this.repository.findById(id);
    if (!category) {
      throw new CategoryError("Category not found", 404);
    }
    return category;
  }

  /**
   * Alias for getCategory for backwards compatibility.
   */
  async getCategoryById(id: string) {
    return this.getCategory(id);
  }

  /**
   * Create a new category with business validation.
   */
  async createCategory(data: CreateCategoryInput, userId?: string) {
    const validated = createCategorySchema.parse(data);

    let code = validated.code;
    if (!code) {
      code = await this.generateCategoryCode(validated.name);
    } else {
      const existing = await this.repository.findByCode(code);
      if (existing) {
        throw new CategoryError(`Category code '${code}' already exists`, 400);
      }
    }

    const parentId = validated.parentId || validated.parentCategoryId || null;
    if (parentId) {
      const parentExists = await this.repository.findById(parentId);
      if (!parentExists) {
        throw new CategoryError("Specified parent category does not exist", 400);
      }
    }

    const created = await this.repository.create({
      code,
      name: validated.name,
      description: validated.description,
      parentCategoryId: parentId,
      parentId: parentId,
      displayOrder: validated.displayOrder,
      isActive: validated.isActive,
      createdBy: userId || null,
    });

    console.log(`[CategoryService] Created category: ${created.id} (${created.code})`);
    return created;
  }

  /**
   * Update category with business validation.
   */
  async updateCategory(id: string, data: UpdateCategoryInput, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new CategoryError("Category not found", 404);
    }

    const validated = updateCategorySchema.parse(data);

    if (validated.code && validated.code !== existing.code) {
      const duplicate = await this.repository.findByCode(validated.code);
      if (duplicate && duplicate.id !== id) {
        throw new CategoryError(`Category code '${validated.code}' is already in use`, 400);
      }
    }

    const newParentId = validated.parentId !== undefined ? validated.parentId : validated.parentCategoryId;
    if (newParentId !== undefined && newParentId !== null && newParentId !== "") {
      await this.checkCircularRelation(id, newParentId);
      const parentExists = await this.repository.findById(newParentId);
      if (!parentExists) {
        throw new CategoryError("Specified parent category does not exist", 400);
      }
    }

    const updated = await this.repository.update(id, {
      code: validated.code,
      name: validated.name,
      description: validated.description,
      parentCategoryId: newParentId,
      parentId: newParentId,
      displayOrder: validated.displayOrder,
      isActive: validated.isActive,
      updatedBy: userId || null,
    });

    console.log(`[CategoryService] Updated category: ${updated.id}`);
    return updated;
  }

  /**
   * Delete category with business rule checks (no child categories, no items).
   */
  async deleteCategory(id: string, _userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new CategoryError("Category not found", 404);
    }

    const children = await this.repository.findChildren(id);
    if (children && children.length > 0) {
      throw new CategoryError(
        `Cannot delete category containing ${children.length} subcategory/subcategories. Reassign or delete subcategories first.`,
        400
      );
    }

    if ((existing as any)._count?.items > 0) {
      throw new CategoryError(
        `Cannot delete category containing ${(existing as any)._count.items} catalog items. Reassign items first.`,
        400
      );
    }

    await this.repository.delete(id);
    console.log(`[CategoryService] Deleted category: ${id}`);
    return { message: "Category deleted successfully", id };
  }
}

export const categoryService = new CategoryService();
