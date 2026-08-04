import { prisma } from "../../db/prisma";
import { CreateUomInput, UpdateUomInput, UomQueryInput } from "../../packages/validation/uom";

export class UomError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UomError";
    this.statusCode = statusCode;
  }
}

export class UomService {
  /**
   * Helper to auto-generate a UOM code if none provided (e.g. UOM-PCS).
   */
  private static async generateUomCode(abbreviation: string, name: string): Promise<string> {
    const rawCode = (abbreviation || name)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const prefix = rawCode.slice(0, 5) || "UOM";
    const candidate = `UOM-${prefix}`;

    const existing = await prisma.unitOfMeasure.findFirst({
      where: { code: candidate, deletedAt: null },
    });

    if (!existing) {
      return candidate;
    }
    return `UOM-${prefix}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Fetch paginated list of Units of Measure with optional search and filters.
   */
  static async getUnits(query: UomQueryInput) {
    const { page, limit, search, isActive, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { code: { contains: term, mode: "insensitive" } },
        { abbreviation: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
      ];
    }

    const [total, data] = await Promise.all([
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

    const formattedData = data.map((item) => ({
      ...item,
      itemsCount: item._count.catalogItems,
    }));

    return {
      data: formattedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Fetch single Unit of Measure by ID.
   */
  static async getUnitById(id: string) {
    const unit = await prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    if (!unit) {
      throw new UomError("Unit of Measure not found", 404);
    }

    return {
      ...unit,
      itemsCount: unit._count.catalogItems,
    };
  }

  /**
   * Create a new Unit of Measure.
   */
  static async createUnit(input: CreateUomInput, userId?: string) {
    let code = input.code?.trim().toUpperCase();

    if (!code) {
      code = await this.generateUomCode(input.abbreviation, input.name);
    } else {
      const existing = await prisma.unitOfMeasure.findFirst({
        where: { code, deletedAt: null },
      });
      if (existing) {
        throw new UomError(`Unit of Measure code '${code}' already exists`, 400);
      }
    }

    const unit = await prisma.unitOfMeasure.create({
      data: {
        code,
        name: input.name.trim(),
        abbreviation: input.abbreviation.trim(),
        description: input.description?.trim() || null,
        displayOrder: input.displayOrder ?? 0,
        isActive: input.isActive ?? true,
        createdBy: userId || null,
        updatedBy: userId || null,
      },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    return {
      ...unit,
      itemsCount: unit._count.catalogItems,
    };
  }

  /**
   * Update an existing Unit of Measure.
   */
  static async updateUnit(id: string, input: UpdateUomInput, userId?: string) {
    const existing = await prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new UomError("Unit of Measure not found", 404);
    }

    let code = input.code !== undefined ? input.code?.trim().toUpperCase() : existing.code;

    if (code && code !== existing.code) {
      const duplicateCode = await prisma.unitOfMeasure.findFirst({
        where: { code, deletedAt: null, NOT: { id } },
      });
      if (duplicateCode) {
        throw new UomError(`Unit of Measure code '${code}' already exists`, 400);
      }
    }

    const updated = await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.abbreviation !== undefined && { abbreviation: input.abbreviation.trim() }),
        ...(input.description !== undefined && { description: input.description?.trim() || null }),
        ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedBy: userId || null,
      },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    return {
      ...updated,
      itemsCount: updated._count.catalogItems,
    };
  }

  /**
   * Soft delete a Unit of Measure (prevents deletion if referenced by catalog items).
   */
  static async deleteUnit(id: string, userId?: string) {
    const existing = await prisma.unitOfMeasure.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { catalogItems: true },
        },
      },
    });

    if (!existing) {
      throw new UomError("Unit of Measure not found", 404);
    }

    // Reference check
    if (existing._count.catalogItems > 0) {
      throw new UomError(
        `Cannot delete Unit of Measure '${existing.name}' because it is referenced by ${existing._count.catalogItems} catalog item(s)`,
        400
      );
    }

    const deleted = await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId || null,
      },
    });

    return deleted;
  }
}
