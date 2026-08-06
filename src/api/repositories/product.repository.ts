import { Prisma, Product } from "@prisma/client";
import { prisma } from "../../db/prisma";

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductData {
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  brandId: string;
  unitId: string;
  costPrice: number;
  sellingPrice: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  trackInventory?: boolean;
  allowNegativeInventory?: boolean;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface UpdateProductData {
  sku?: string;
  barcode?: string | null;
  name?: string;
  description?: string | null;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  costPrice?: number;
  sellingPrice?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  trackInventory?: boolean;
  allowNegativeInventory?: boolean;
  isActive?: boolean;
  updatedBy?: string | null;
}

export class ProductRepository {
  async findAll(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.pageSize || filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters.brandId) {
      where.brandId = filters.brandId;
    }
    
    if (filters.unitId) {
      where.unitId = filters.unitId;
    }

    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
        { barcode: { contains: term, mode: "insensitive" } },
      ];
    }

    const allowedSortFields = ["sku", "name", "sellingPrice", "createdAt", "updatedAt"];
    const sortBy = filters.sortBy && allowedSortFields.includes(filters.sortBy) ? filters.sortBy : "name";
    const sortOrder: "asc" | "desc" = filters.sortOrder === "desc" ? "desc" : "asc";

    const [total, data] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          brand: true,
          unit: true,
        },
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

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });
  }

  async findBySku(sku: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { id },
    });
    return count > 0;
  }

  async create(data: CreateProductData): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
      },
    });
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
