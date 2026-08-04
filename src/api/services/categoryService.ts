import { prisma } from "../../db/prisma";
import { CreateCategoryInput, UpdateCategoryInput, CategoryQueryInput } from "../../packages/validation/category";

export class CategoryError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "CategoryError";
    this.statusCode = statusCode;
  }
}

export class CategoryService {
  /**
   * Helper to check for circular parent-child relationships.
   * Ensures targetParentId is not categoryId itself or any of categoryId's descendants.
   */
  private static async checkCircularRelation(categoryId: string, targetParentId: string): Promise<void> {
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

      const parent: { parentCategoryId: string | null } | null = await prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentCategoryId: true },
      });

      if (!parent) break;
      currentParentId = parent.parentCategoryId;
    }
  }

  /**
   * Helper to auto-generate a category code if none provided (e.g. CAT-00001).
   */
  private static async generateCategoryCode(name: string): Promise<string> {
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 3)
      .toUpperCase() || "CAT";

    const count = await prisma.category.count();
    const candidate = `${prefix}-${String(count + 1).padStart(4, "0")}`;

    // Check if candidate exists
    const existing = await prisma.category.findUnique({ where: { code: candidate } });
    if (!existing) {
      return candidate;
    }
    return `CAT-${Date.now().toString().slice(-6)}`;
  }

  /**
   * Get paginated list of categories with search, filter, and sorting.
   */
  static async getCategories(query: CategoryQueryInput) {
    const { page = 1, limit = 10, search, isActive, parentCategoryId, sortBy = "displayOrder", sortOrder = "asc", tree } = query;

    if (tree) {
      return this.getCategoryTree(isActive);
    }

    const where: any = {
      deletedAt: null,
    };

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (parentCategoryId !== undefined) {
      if (parentCategoryId === "null" || parentCategoryId === "root" || parentCategoryId === null) {
        where.parentCategoryId = null;
      } else if (parentCategoryId) {
        where.parentCategoryId = parentCategoryId;
      }
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { code: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: {
          parent: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: { children: true, items: true },
          },
        },
        orderBy: [
          { [sortBy]: sortOrder },
          { name: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Get category tree structure (hierarchical root categories with nested children).
   */
  static async getCategoryTree(isActiveOnly?: boolean) {
    const where: any = {
      deletedAt: null,
    };
    if (typeof isActiveOnly === "boolean") {
      where.isActive = isActiveOnly;
    }

    const allCategories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
    });

    // Build hierarchy
    const categoryMap = new Map<string, any>();
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const rootNodes: any[] = [];

    allCategories.forEach((cat) => {
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
   * Get single category by ID.
   */
  static async getCategoryById(id: string) {
    const category = await prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true, code: true, isActive: true, displayOrder: true },
          orderBy: { displayOrder: "asc" },
        },
        _count: {
          select: { items: true, children: true },
        },
      },
    });

    if (!category) {
      throw new CategoryError("Category not found", 404);
    }

    return category;
  }

  /**
   * Create a new category.
   */
  static async createCategory(data: CreateCategoryInput, userId?: string) {
    let code = data.code ? data.code.trim().toUpperCase() : "";

    if (!code) {
      code = await this.generateCategoryCode(data.name);
    } else {
      // Check code uniqueness
      const existing = await prisma.category.findUnique({
        where: { code },
      });
      if (existing) {
        if (existing.deletedAt) {
          // If soft deleted, append timestamp to old soft deleted category's code
          await prisma.category.update({
            where: { id: existing.id },
            data: { code: `${existing.code}_DELETED_${Date.now()}` },
          });
        } else {
          throw new CategoryError(`Category code '${code}' already exists`, 400);
        }
      }
    }

    // Validate parent category if provided
    let parentCategoryId = data.parentCategoryId || null;
    if (parentCategoryId) {
      const parentExists = await prisma.category.findFirst({
        where: { id: parentCategoryId, deletedAt: null },
      });
      if (!parentExists) {
        throw new CategoryError("Specified parent category does not exist", 400);
      }
    }

    const category = await prisma.category.create({
      data: {
        code,
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        parentCategoryId,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: userId || null,
        updatedBy: userId || null,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return category;
  }

  /**
   * Update an existing category.
   */
  static async updateCategory(id: string, data: UpdateCategoryInput, userId?: string) {
    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new CategoryError("Category not found", 404);
    }

    const updateData: any = {
      updatedBy: userId || null,
    };

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description ? data.description.trim() : null;
    }

    if (data.displayOrder !== undefined) {
      updateData.displayOrder = data.displayOrder;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    if (data.code !== undefined && data.code.trim().toUpperCase() !== existing.code) {
      const newCode = data.code.trim().toUpperCase();
      const duplicate = await prisma.category.findUnique({
        where: { code: newCode },
      });
      if (duplicate && duplicate.id !== id) {
        if (duplicate.deletedAt) {
          await prisma.category.update({
            where: { id: duplicate.id },
            data: { code: `${duplicate.code}_DELETED_${Date.now()}` },
          });
        } else {
          throw new CategoryError(`Category code '${newCode}' is already in use`, 400);
        }
      }
      updateData.code = newCode;
    }

    if (data.parentCategoryId !== undefined) {
      const newParentId = data.parentCategoryId || null;
      if (newParentId) {
        await this.checkCircularRelation(id, newParentId);

        const parentExists = await prisma.category.findFirst({
          where: { id: newParentId, deletedAt: null },
        });
        if (!parentExists) {
          throw new CategoryError("Specified parent category does not exist", 400);
        }
      }
      updateData.parentCategoryId = newParentId;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return updated;
  }

  /**
   * Soft delete a category.
   */
  static async deleteCategory(id: string, userId?: string) {
    const existing = await prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    if (!existing) {
      throw new CategoryError("Category not found", 404);
    }

    // Check if category has subcategories or items
    if (existing.children && existing.children.length > 0) {
      throw new CategoryError(
        `Cannot delete category containing ${existing.children.length} subcategory/subcategories. Reassign or delete subcategories first.`,
        400
      );
    }

    if (existing._count.items > 0) {
      throw new CategoryError(
        `Cannot delete category containing ${existing._count.items} catalog items. Reassign items first.`,
        400
      );
    }

    await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId || null,
      },
    });

    return { message: "Category deleted successfully", id };
  }
}
