import { z } from "zod";

export const createUomSchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, "Code cannot exceed 50 characters")
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
    .max(20, "Abbreviation cannot exceed 20 characters"),
  description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional().nullable(),
  displayOrder: z.coerce.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateUomSchema = createUomSchema.partial();

export const uomQuerySchema = z.object({
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
  sortBy: z.enum(["name", "code", "abbreviation", "displayOrder", "createdAt", "updatedAt"]).optional().default("displayOrder"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type CreateUomInput = z.infer<typeof createUomSchema>;
export type UpdateUomInput = z.infer<typeof updateUomSchema>;
export type UomQueryInput = z.infer<typeof uomQuerySchema>;
