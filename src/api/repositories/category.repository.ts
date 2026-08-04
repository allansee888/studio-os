import { Prisma, Category } from "@prisma/client";
import { prisma } from "../../db/prisma";

export interface CategoryFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string | null;
  parentCategoryId?: string | null;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  includeChildren?: boolean;
  includeParent?: boolean;
  includeItemsCount?: boolean;
}

export interface PaginatedCategories {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryData {
  code: string;
  name: string;
  description?: string | null;
  parentCategoryId?: string | null;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateCategoryData {
  code?: string;
  name?: string;
  description?: string | null;
  parentCategoryId?: string | null;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export class CategoryRepository {
  /**
   * Find categories with pagination, filtering, search, and sorting.
   */
  async findAll(filters: CategoryFilters = {}): Promise<PaginatedCategories> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.pageSize || filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CategoryWhereInput = {
      deletedAt: null,
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { code: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const rawParentId = filters.parentId !== undefined ? filters.parentId : filters.parentCategoryId;
    if (rawParentId !== undefined) {
      if (rawParentId === null || rawParentId === "null" || rawParentId === "root") {
        where.parentCategoryId = null;
      } else {
        where.parentCategoryId = rawParentId;
      }
    }

    const allowedSortFields = ["name", "code", "displayOrder", "createdAt", "updatedAt"];
    const sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : "displayOrder";
    const sortOrder: "asc" | "desc" = filters.sortOrder === "desc" ? "desc" : "asc";

    const include: Prisma.CategoryInclude = {};
    if (filters.includeParent) {
      include.parent = true;
    }
    if (filters.includeChildren) {
      include.children = {
        where: { deletedAt: null },
      };
    }
    if (filters.includeItemsCount) {
      include._count = {
        select: { items: true, children: true },
      };
    }

    const [total, data] = await prisma.$transaction([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        ...(Object.keys(include).length > 0 ? { include } : {}),
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find category by UUID primary key.
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: { items: true, children: true },
        },
      },
    });
  }

  /**
   * Find category by unique code.
   */
  async findByCode(code: string): Promise<Category | null> {
    return prisma.category.findFirst({
      where: {
        code,
        deletedAt: null,
      },
      include: {
        parent: true,
      },
    });
  }

  /**
   * Find immediate child categories under a parent category.
   * If parentId is null, returns root categories.
   */
  async findChildren(parentId: string | null): Promise<Category[]> {
    const targetParentId = parentId === "null" || parentId === "root" ? null : parentId;
    return prisma.category.findMany({
      where: {
        parentCategoryId: targetParentId,
        deletedAt: null,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        _count: {
          select: { items: true, children: true },
        },
      },
    });
  }

  /**
   * Create a new category record.
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const parentCategoryId = data.parentCategoryId ?? data.parentId ?? null;
    return prisma.category.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        parentCategoryId,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy ?? null,
      },
      include: {
        parent: true,
      },
    });
  }

  /**
   * Update an existing category by ID.
   */
  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const updatePayload: Prisma.CategoryUpdateInput = {};

    if (data.code !== undefined) updatePayload.code = data.code;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;

    const parentIdValue = data.parentCategoryId !== undefined ? data.parentCategoryId : data.parentId;
    if (parentIdValue !== undefined) {
      if (parentIdValue === null || parentIdValue === "" || parentIdValue === "null") {
        updatePayload.parent = { disconnect: true };
      } else {
        updatePayload.parent = { connect: { id: parentIdValue } };
      }
    }

    if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy;
    if (data.deletedAt !== undefined) updatePayload.deletedAt = data.deletedAt;

    return prisma.category.update({
      where: { id },
      data: updatePayload,
      include: {
        parent: true,
      },
    });
  }

  /**
   * Soft delete category by setting deletedAt timestamp.
   */
  async delete(id: string): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export const categoryRepository = new CategoryRepository();
