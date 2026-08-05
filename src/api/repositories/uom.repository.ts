import { Prisma, UnitOfMeasure } from "@prisma/client";
import { prisma } from "../../db/prisma";

export interface UomFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUoms {
  data: (UnitOfMeasure & { itemsCount?: number })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUomData {
  code: string;
  name: string;
  abbreviation: string;
  description?: string | null;
  decimalPlaces?: number;
  displayOrder?: number;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateUomData {
  code?: string;
  name?: string;
  abbreviation?: string;
  description?: string | null;
  decimalPlaces?: number;
  displayOrder?: number;
  isActive?: boolean;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}

export class UomRepository {
  /**
   * Find Units of Measure with pagination, search, filter, and sorting.
   */
  async findAll(filters: UomFilters = {}): Promise<PaginatedUoms> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.pageSize || filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UnitOfMeasureWhereInput = {
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
        { abbreviation: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["name", "code", "abbreviation", "displayOrder", "createdAt", "updatedAt"];
    const sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : "displayOrder";
    const sortOrder: "asc" | "desc" = filters.sortOrder === "desc" ? "desc" : "asc";

    const [total, rawData] = await prisma.$transaction([
      prisma.unitOfMeasure.count({ where }),
      prisma.unitOfMeasure.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { catalogItems: true },
          },
        },
      }),
    ]);

    const data = rawData.map((item) => ({
      ...item,
      itemsCount: item._count?.catalogItems ?? 0,
    }));

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
   * Find Unit of Measure by ID.
   */
  async findById(id: string): Promise<(UnitOfMeasure & { itemsCount?: number }) | null> {
    const unit = await prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    if (!unit) return null;

    return {
      ...unit,
      itemsCount: unit._count?.catalogItems ?? 0,
    };
  }

  /**
   * Find Unit of Measure by unique code.
   */
  async findByCode(code: string): Promise<UnitOfMeasure | null> {
    return prisma.unitOfMeasure.findFirst({
      where: {
        code: { equals: code, mode: "insensitive" },
        deletedAt: null,
      },
    });
  }

  /**
   * Find Unit of Measure by unique name.
   */
  async findByName(name: string): Promise<UnitOfMeasure | null> {
    return prisma.unitOfMeasure.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        deletedAt: null,
      },
    });
  }

  /**
   * Find Unit of Measure by abbreviation.
   */
  async findByAbbreviation(abbreviation: string): Promise<UnitOfMeasure | null> {
    return prisma.unitOfMeasure.findFirst({
      where: {
        abbreviation: { equals: abbreviation, mode: "insensitive" },
        deletedAt: null,
      },
    });
  }

  /**
   * Create a new Unit of Measure.
   */
  async create(data: CreateUomData): Promise<UnitOfMeasure & { itemsCount?: number }> {
    const unit = await prisma.unitOfMeasure.create({
      data: {
        code: data.code,
        name: data.name,
        abbreviation: data.abbreviation,
        description: data.description ?? null,
        decimalPlaces: data.decimalPlaces ?? 2,
        displayOrder: data.displayOrder ?? 0,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy ?? null,
        updatedBy: data.createdBy ?? null,
      },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    return {
      ...unit,
      itemsCount: unit._count?.catalogItems ?? 0,
    };
  }

  /**
   * Update an existing Unit of Measure.
   */
  async update(id: string, data: UpdateUomData): Promise<UnitOfMeasure & { itemsCount?: number }> {
    const updatePayload: Prisma.UnitOfMeasureUpdateInput = {};

    if (data.code !== undefined) updatePayload.code = data.code;
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.abbreviation !== undefined) updatePayload.abbreviation = data.abbreviation;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.decimalPlaces !== undefined) updatePayload.decimalPlaces = data.decimalPlaces;
    if (data.displayOrder !== undefined) updatePayload.displayOrder = data.displayOrder;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;
    if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy;
    if (data.deletedAt !== undefined) updatePayload.deletedAt = data.deletedAt;

    const updated = await prisma.unitOfMeasure.update({
      where: { id },
      data: updatePayload,
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    return {
      ...updated,
      itemsCount: updated._count?.catalogItems ?? 0,
    };
  }

  /**
   * Soft delete Unit of Measure by setting deletedAt.
   */
  async delete(id: string, userId?: string): Promise<UnitOfMeasure> {
    return prisma.unitOfMeasure.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId ?? null,
      },
    });
  }
}

export const uomRepository = new UomRepository();
