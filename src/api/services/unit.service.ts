import { UomRepository, uomRepository, UomFilters } from "../repositories/uom.repository";
import {
  CreateUnitInput,
  UpdateUnitInput,
  UnitFilterInput,
  CreateUnitSchema,
  UpdateUnitSchema,
  UnitFilterSchema,
} from "../../packages/validation/uom";

export class UnitError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "UnitError";
    this.statusCode = statusCode;
  }
}

// Alias for UomError compatibility
export const UomError = UnitError;

export class UnitService {
  private repository: UomRepository;

  constructor(repository: UomRepository = uomRepository) {
    this.repository = repository;
  }

  /**
   * Helper to auto-generate a Unit code if none provided.
   */
  private async generateUnitCode(abbreviation: string, name: string): Promise<string> {
    const rawCode = (abbreviation || name)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    const prefix = rawCode.slice(0, 5) || "UNIT";
    const candidate = `UOM-${prefix}`;

    const existing = await this.repository.findByCode(candidate);
    if (!existing) {
      return candidate;
    }
    return `UOM-${prefix}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Fetch paginated list of Units with optional search and filters.
   */
  async getUnits(query: UnitFilterInput = {}) {
    const validated = UnitFilterSchema.safeParse(query);
    const filterInput = validated.success ? validated.data : query;

    const isActiveBool =
      filterInput.isActive === "true" || filterInput.isActive === true
        ? true
        : filterInput.isActive === "false" || filterInput.isActive === false
        ? false
        : undefined;

    const repoFilters: UomFilters = {
      page: filterInput.page,
      limit: filterInput.limit,
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
   * Fetch single Unit by ID.
   */
  async getUnit(id: string) {
    const unit = await this.repository.findById(id);
    if (!unit) {
      throw new UnitError("Unit of Measure not found", 404);
    }
    return unit;
  }

  /**
   * Alias for getUnit for backwards compatibility.
   */
  async getUnitById(id: string) {
    return this.getUnit(id);
  }

  /**
   * Create a new Unit with business rules & validation.
   */
  async createUnit(input: CreateUnitInput, userId?: string) {
    const name = input.name?.trim();
    if (!name) {
      throw new UnitError("Name is required", 400);
    }

    const abbreviation = input.abbreviation?.trim().toUpperCase();
    if (!abbreviation) {
      throw new UnitError("Abbreviation is required", 400);
    }

    // Business Rule: Check Decimal places between 0 and 6
    const decimalPlaces = input.decimalPlaces ?? 2;
    if (decimalPlaces < 0 || decimalPlaces > 6) {
      throw new UnitError("Decimal places must be between 0 and 6", 400);
    }

    // Business Rule: Name must be unique
    const existingName = await this.repository.findByName(name);
    if (existingName) {
      throw new UnitError(`Unit of Measure with name '${name}' already exists`, 400);
    }

    // Business Rule: Prevent duplicate abbreviations
    const existingAbb = await this.repository.findByAbbreviation(abbreviation);
    if (existingAbb) {
      throw new UnitError(`Unit of Measure with abbreviation '${abbreviation}' already exists`, 400);
    }

    // Business Rule: Code must be unique & stored in uppercase
    let code = input.code?.trim().toUpperCase();
    if (!code) {
      code = await this.generateUnitCode(abbreviation, name);
    } else {
      const existingCode = await this.repository.findByCode(code);
      if (existingCode) {
        throw new UnitError(`Unit of Measure code '${code}' already exists`, 400);
      }
    }

    const created = await this.repository.create({
      code,
      name,
      abbreviation,
      description: input.description?.trim() || null,
      decimalPlaces,
      displayOrder: input.displayOrder ?? 0,
      isActive: input.isActive ?? true,
      createdBy: userId || null,
    });

    console.log(`[UnitService] Created unit: ${created.id} (${created.code})`);
    return created;
  }

  /**
   * Update an existing Unit with business rules & validation.
   */
  async updateUnit(id: string, input: UpdateUnitInput, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new UnitError("Unit of Measure not found", 404);
    }

    // Business Rule: Check decimalPlaces if provided
    if (input.decimalPlaces !== undefined) {
      if (input.decimalPlaces < 0 || input.decimalPlaces > 6) {
        throw new UnitError("Decimal places must be between 0 and 6", 400);
      }
    }

    // Business Rule: Check Name uniqueness if updated
    let name: string | undefined = undefined;
    if (input.name !== undefined) {
      const trimmedName = input.name.trim();
      if (!trimmedName) {
        throw new UnitError("Name is required", 400);
      }
      const duplicateName = await this.repository.findByName(trimmedName);
      if (duplicateName && duplicateName.id !== id) {
        throw new UnitError(`Unit of Measure with name '${trimmedName}' already exists`, 400);
      }
      name = trimmedName;
    }

    // Business Rule: Check Abbreviation uniqueness if updated (stored uppercase)
    let abbreviation: string | undefined = undefined;
    if (input.abbreviation !== undefined) {
      const trimmedAbb = input.abbreviation.trim().toUpperCase();
      if (!trimmedAbb) {
        throw new UnitError("Abbreviation is required", 400);
      }
      const duplicateAbb = await this.repository.findByAbbreviation(trimmedAbb);
      if (duplicateAbb && duplicateAbb.id !== id) {
        throw new UnitError(`Unit of Measure with abbreviation '${trimmedAbb}' already exists`, 400);
      }
      abbreviation = trimmedAbb;
    }

    // Business Rule: Check Code uniqueness if updated (stored uppercase)
    let code: string | undefined = undefined;
    if (input.code !== undefined && input.code !== null && input.code.trim() !== "") {
      code = input.code.trim().toUpperCase();
      const duplicateCode = await this.repository.findByCode(code);
      if (duplicateCode && duplicateCode.id !== id) {
        throw new UnitError(`Unit of Measure code '${code}' already exists`, 400);
      }
    }

    const updated = await this.repository.update(id, {
      ...(code !== undefined && { code }),
      ...(name !== undefined && { name }),
      ...(abbreviation !== undefined && { abbreviation }),
      ...(input.description !== undefined && { description: input.description?.trim() || null }),
      ...(input.decimalPlaces !== undefined && { decimalPlaces: input.decimalPlaces }),
      ...(input.displayOrder !== undefined && { displayOrder: input.displayOrder }),
      ...(input.isActive !== undefined && { isActive: input.isActive }),
      updatedBy: userId || null,
    });

    console.log(`[UnitService] Updated unit: ${updated.id}`);
    return updated;
  }

  /**
   * Delete a Unit (prevents deletion if referenced by catalog items).
   */
  async deleteUnit(id: string, userId?: string) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new UnitError("Unit of Measure not found", 404);
    }

    // Reference check
    if (existing.itemsCount && existing.itemsCount > 0) {
      throw new UnitError(
        `Cannot delete Unit of Measure '${existing.name}' because it is referenced by ${existing.itemsCount} catalog item(s)`,
        400
      );
    }

    const deleted = await this.repository.delete(id, userId);
    console.log(`[UnitService] Deleted unit: ${id}`);
    return deleted;
  }
}

export const unitService = new UnitService();

// Aliases for UomService compatibility
export type UomService = UnitService;
export const UomService = UnitService;
export const uomService = unitService;

