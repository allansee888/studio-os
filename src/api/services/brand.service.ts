import { BrandRepository, brandRepository, BrandFilters } from "../repositories/brand.repository";
import {
  CreateBrandInput,
  UpdateBrandInput,
  BrandFilterInput,
  CreateBrandSchema,
  BrandFilterSchema,
} from "../../packages/validation/brand";

export class BrandError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "BrandError";
    this.statusCode = statusCode;
  }
}

export class BrandService {
  private repository: BrandRepository;

  constructor(repository: BrandRepository = brandRepository) {
    this.repository = repository;
  }

  static async getBrands(query: BrandFilterInput = {}) {
    return brandService.getBrands(query);
  }

  static async getBrand(id: string) {
    return brandService.getBrand(id);
  }

  static async getBrandById(id: string) {
    return brandService.getBrandById(id);
  }

  static async createBrand(input: CreateBrandInput, userId?: string) {
    return brandService.createBrand(input, userId);
  }

  static async updateBrand(id: string, input: UpdateBrandInput, userId?: string) {
    return brandService.updateBrand(id, input, userId);
  }

  static async deleteBrand(id: string, userId?: string) {
    return brandService.deleteBrand(id, userId);
  }

  /**
   * Fetch paginated list of Brands with optional search and filters.
   */
  async getBrands(query: BrandFilterInput = {}) {
    const validated = BrandFilterSchema.safeParse(query);
    const filterInput = validated.success ? validated.data : query;

    const isActiveBool =
      filterInput.isActive === "true" || filterInput.isActive === true
        ? true
        : filterInput.isActive === "false" || filterInput.isActive === false
        ? false
        : undefined;

    const repoFilters: BrandFilters = {
      page: filterInput.page,
      limit: filterInput.limit || filterInput.pageSize,
      pageSize: filterInput.pageSize,
      search: filterInput.search,
      isActive: isActiveBool,
      sortBy: filterInput.sortBy,
      sortOrder: filterInput.sortOrder,
    };

    const result = await this.repository.findAll(repoFilters);
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
   * Fetch single Brand by ID.
   */
  async getBrand(id: string) {
    const brand = await this.repository.findById(id);
    if (!brand) {
      throw new BrandError("Brand not found", 404);
    }
    return brand;
  }

  /**
   * Alias for getBrand for backwards compatibility.
   */
  async getBrandById(id: string) {
    return this.getBrand(id);
  }

  /**
   * Create a new Brand with business rules & validation.
   */
  async createBrand(input: CreateBrandInput, userId?: string) {
    const parsedResult = CreateBrandSchema.safeParse(input);
    if (!parsedResult.success) {
      const firstError =
        parsedResult.error.issues?.[0]?.message ||
        (parsedResult.error as any).errors?.[0]?.message ||
        "Invalid brand input";
      throw new BrandError(firstError, 400);
    }
    const validated = parsedResult.data;

    // Business Rule: Code must be unique & stored in uppercase
    const existingCode = await this.repository.findByCode(validated.code);
    if (existingCode) {
      throw new BrandError(`Brand code '${validated.code}' already exists`, 400);
    }

    // Business Rule: Name must be unique
    const existingName = await this.repository.findByName(validated.name);
    if (existingName) {
      throw new BrandError(`Brand with name '${validated.name}' already exists`, 400);
    }

    const created = await this.repository.create({
      code: validated.code,
      name: validated.name,
      description: validated.description || null,
      logoUrl: validated.logoUrl || null,
      website: validated.website || null,
      isActive: validated.isActive ?? true,
      createdBy: userId || null,
    });

    console.log(`[BrandService] Created brand: ${created.id} (${created.code})`);
    return created;
  }

  /**
   * Update an existing Brand with business rules & validation.
   */
  async updateBrand(id: string, input: UpdateBrandInput, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new BrandError("Brand not found", 404);
    }

    let code: string | undefined = undefined;
    if (input.code !== undefined && input.code !== null && input.code.trim() !== "") {
      code = input.code.trim().toUpperCase();
      const duplicateCode = await this.repository.findByCode(code);
      if (duplicateCode && duplicateCode.id !== id) {
        throw new BrandError(`Brand code '${code}' already exists`, 400);
      }
    }

    let name: string | undefined = undefined;
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new BrandError("Name is required", 400);
      }
      const duplicateName = await this.repository.findByName(trimmedName);
      if (duplicateName && duplicateName.id !== id) {
        throw new BrandError(`Brand with name '${trimmedName}' already exists`, 400);
      }
      name = trimmedName;
    }

    let logoUrl: string | null | undefined = undefined;
    if (input.logoUrl !== undefined) {
      if (input.logoUrl && input.logoUrl.trim() !== "") {
        const trimmedUrl = input.logoUrl.trim();
        try {
          new URL(trimmedUrl);
        } catch {
          throw new BrandError("Invalid Logo URL format", 400);
        }
        logoUrl = trimmedUrl;
      } else {
        logoUrl = null;
      }
    }

    let website: string | null | undefined = undefined;
    if (input.website !== undefined) {
      if (input.website && input.website.trim() !== "") {
        const trimmedUrl = input.website.trim();
        try {
          new URL(trimmedUrl);
        } catch {
          throw new BrandError("Invalid website URL format", 400);
        }
        website = trimmedUrl;
      } else {
        website = null;
      }
    }

    const updated = await this.repository.update(id, {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(website !== undefined && { website }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedBy: userId || null,
    });

    console.log(`[BrandService] Updated brand: ${updated.id}`);
    return updated;
  }

  /**
   * Delete a Brand (with placeholder check for future Product relationships).
   */
  async deleteBrand(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new BrandError("Brand not found", 404);
    }

    // Placeholder check: Prevent deletion if products are linked (for future Product module integration)
    if ((existing as any).productsCount > 0 || (existing as any)._count?.products > 0) {
      throw new BrandError(
        `Cannot delete Brand '${existing.name}' because it is associated with existing products`,
        400
      );
    }

    const deleted = await this.repository.delete(id, userId);
    console.log(`[BrandService] Deleted brand: ${id}`);
    return deleted;
  }
}

export const brandService = new BrandService();
