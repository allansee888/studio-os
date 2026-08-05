import { z } from "zod";

export const createUnitSchema = z.object({
  code: z
    .string()
    .trim()
    .max(20, "Code cannot exceed 20 characters")
    .transform((val) => val ? val.toUpperCase() : val)
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  abbreviation: z
    .string()
    .trim()
    .min(1, "Abbreviation is required")
    .max(10, "Abbreviation cannot exceed 10 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  decimalPlaces: z.coerce
    .number()
    .int("Decimal places must be an integer")
    .min(0, "Decimal places must be between 0 and 6")
    .max(6, "Decimal places must be between 0 and 6")
    .optional()
    .default(2),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateUnitSchema = createUnitSchema.partial();

export const unitFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    })
    .optional(),
  sortBy: z
    .enum(["name", "code", "abbreviation", "displayOrder", "createdAt", "updatedAt"])
    .optional()
    .default("displayOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Named exports requested by Task UNIT-001.1
export const CreateUnitSchema = createUnitSchema;
export const UpdateUnitSchema = updateUnitSchema;
export const UnitFilterSchema = unitFilterSchema;

// Backwards compatibility aliases
export const createUomSchema = createUnitSchema;
export const updateUomSchema = updateUnitSchema;
export const uomQuerySchema = unitFilterSchema;

export type CreateUnitInput = {
  name: string;
  abbreviation: string;
  code?: string;
  description?: string | null;
  decimalPlaces?: number;
  displayOrder?: number;
  isActive?: boolean;
};

export type UpdateUnitInput = Partial<CreateUnitInput>;

export type UnitFilterInput = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean | string;
  sortBy?: "name" | "code" | "abbreviation" | "displayOrder" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

// Backwards compatibility types
export type CreateUomInput = CreateUnitInput;
export type UpdateUomInput = UpdateUnitInput;
export type UomQueryInput = UnitFilterInput;

