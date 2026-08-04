import { z } from "zod";

export const createCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, "Code cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  parentCategoryId: z.string().uuid("Invalid parent category ID").optional().nullable().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryQuerySchema = z.object({
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
