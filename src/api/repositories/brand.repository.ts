import { Prisma, Brand } from "@prisma/client";
import { prisma } from "../../db/prisma";

export interface BrandFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedBrands {
  data: Brand[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateBrandData {
  code: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateBrandData {
  code?: string;
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export class BrandRepository {
  /**
   * Find brands with pagination, search, filter, and sorting.
   */
  async findAll(filters: BrandFilters = {}): Promise<PaginatedBrands> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.pageSize || filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BrandWhereInput = {
      deletedAt: null,
    };

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { code: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["name", "code", "createdAt", "updatedAt"];
    const sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : "name";
    const sortOrder: "asc" | "desc" = filters.sortOrder === "desc" ? "desc" : "asc";

    const [total, data] = await prisma.$transaction([
      prisma.brand.count({ where }),
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
   * Find brand by ID.
   */
  async findById(id: string): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Find brand by unique code.
   */
  async findByCode(code: string): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        code: { equals: code, mode: "insensitive" },
        deletedAt: null,
      },
    });
  }

  /**
   * Find brand by unique name.
   */
  async findByName(name: string): Promise<Brand | null> {
    return prisma.brand.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
      },
    });
  }

  /**
   * Check if brand exists by ID.
   */
  async exists(id: string): Promise<boolean> {
    const count = await prisma.brand.count({
      where: {
        id,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  /**
   * Create a new brand.
   */
  async create(data: CreateBrandData): Promise<Brand> {
    return prisma.brand.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        logoUrl: data.logoUrl ?? null,
        website: data.website ?? null,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null,
      },
    });
  }

  /**
   * Update an existing brand.
   */
  async update(id: string, data: UpdateBrandData): Promise<Brand> {
    const updatePayload: Prisma.BrandUpdateInput = {};

    if (data.code !== undefined) updatePayload.code = data.code;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
    if (data.website !== undefined) updatePayload.website = data.website;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy;
    if (data.deletedAt !== undefined) updatePayload.deletedAt = data.deletedAt;

    return prisma.brand.update({
      where: { id },
      data: updatePayload,
    });
  }

  /**
   * Soft delete brand by setting deletedAt timestamp.
   */
  async delete(id: string, userId?: string): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId ?? null,
      },
    });
  }
}

export const brandRepository = new BrandRepository();
