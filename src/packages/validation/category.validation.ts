import { z } from "zod";

/**
 * Validation schema for creating a Category.
 */
export const createCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Category code must be at least 2 characters")
    .max(20, "Category code cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9-]+$/, "Category code must contain only letters, numbers, and hyphens")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  parentId: z
    .string()
    .uuid("Invalid parent category ID")
    .optional()
    .nullable()
    .or(z.literal("")),
  parentCategoryId: z
    .string()
    .uuid("Invalid parent category ID")
    .optional()
    .nullable()
    .or(z.literal("")),
  displayOrder: z.coerce
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be at least 0")
    .optional()
    .default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Validation schema for updating a Category.
 */
export const updateCategorySchema = createCategorySchema.partial();

/**
 * Validation schema for querying Categories.
 */
export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(1),
  pageSize: z.coerce.number().int().min(1, "Page size must be at least 1").max(100, "Page size cannot exceed 100").optional(),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").optional().default(10),
  search: z.string().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    })
    .optional(),
  parentId: z.string().optional().nullable(),
  parentCategoryId: z.string().optional().nullable(),
  includeChildren: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === "true" || val === true)
    .optional(),
  tree: z
    .union([z.boolean(), z.string()])
    .transform((val) => val === "true" || val === true)
    .optional(),
  sortBy: z.enum(["name", "code", "displayOrder", "createdAt", "updatedAt"]).optional().default("displayOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryQueryInput = z.infer<typeof categoryQuerySchema>;
