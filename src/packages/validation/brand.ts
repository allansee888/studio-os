import { z } from "zod";

/**
 * Validation schema for creating a Brand.
 */
export const createBrandSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Brand code is required")
    .max(20, "Brand code cannot exceed 20 characters")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(1, "Brand name is required")
    .max(100, "Brand name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  logoUrl: z
    .string()
    .trim()
    .max(500, "Logo URL cannot exceed 500 characters")
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid Logo URL format" }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .max(255, "Website URL cannot exceed 255 characters")
    .refine(
      (val) => {
        if (!val) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid website URL format" }
    )
    .optional()
    .nullable()
    .or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating a Brand.
 */
export const updateBrandSchema = createBrandSchema.partial();

/**
 * Validation schema for filtering/querying Brands.
 */
export const brandFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
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
    .enum(["name", "code", "createdAt", "updatedAt"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Named exports as specified in Task BRAND-001.1
export const CreateBrandSchema = createBrandSchema;
export const UpdateBrandSchema = updateBrandSchema;
export const BrandFilterSchema = brandFilterSchema;

export type CreateBrandInput = {
  code: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  isActive?: boolean;
};

export type UpdateBrandInput = Partial<CreateBrandInput>;

export type BrandFilterInput = {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean | string;
  sortBy?: "name" | "code" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};
