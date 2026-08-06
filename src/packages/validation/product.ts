import { z } from "zod";

/**
 * Validation schema for creating a Product.
 */
export const createProductSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(40, "SKU cannot exceed 40 characters")
      .transform((val) => val.toUpperCase()),
    barcode: z
      .string()
      .trim()
      .max(50, "Barcode cannot exceed 50 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(200, "Name cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional()
      .nullable()
      .or(z.literal("")),

    categoryId: z.string().uuid("Invalid Category ID format"),
    brandId: z.string().uuid("Invalid Brand ID format"),
    unitId: z.string().uuid("Invalid Unit ID format"),

    costPrice: z.coerce.number().min(0, "Cost Price must be greater than or equal to 0"),
    sellingPrice: z.coerce.number().min(0, "Selling Price must be greater than or equal to 0"),

    minimumStock: z.coerce.number().int("Minimum Stock must be an integer").min(0, "Minimum Stock must be greater than or equal to 0"),
    maximumStock: z.coerce.number().int("Maximum Stock must be an integer").min(0, "Maximum Stock must be greater than or equal to 0"),
    reorderPoint: z.coerce.number().int("Reorder Point must be an integer").min(0, "Reorder Point must be greater than or equal to 0"),

    trackInventory: z.boolean().optional().default(true),
    allowNegativeInventory: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.maximumStock < data.minimumStock) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum Stock must be greater than or equal to Minimum Stock",
        path: ["maximumStock"],
      });
    }
  });

/**
 * Validation schema for updating a Product.
 */
export const updateProductSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .min(1, "SKU is required")
      .max(40, "SKU cannot exceed 40 characters")
      .transform((val) => val.toUpperCase())
      .optional(),
    barcode: z
      .string()
      .trim()
      .max(50, "Barcode cannot exceed 50 characters")
      .optional()
      .nullable()
      .or(z.literal("")),
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(200, "Name cannot exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional()
      .nullable()
      .or(z.literal("")),

    categoryId: z.string().uuid("Invalid Category ID format").optional(),
    brandId: z.string().uuid("Invalid Brand ID format").optional(),
    unitId: z.string().uuid("Invalid Unit ID format").optional(),

    costPrice: z.coerce.number().min(0, "Cost Price must be greater than or equal to 0").optional(),
    sellingPrice: z.coerce.number().min(0, "Selling Price must be greater than or equal to 0").optional(),

    minimumStock: z.coerce.number().int("Minimum Stock must be an integer").min(0, "Minimum Stock must be greater than or equal to 0").optional(),
    maximumStock: z.coerce.number().int("Maximum Stock must be an integer").min(0, "Maximum Stock must be greater than or equal to 0").optional(),
    reorderPoint: z.coerce.number().int("Reorder Point must be an integer").min(0, "Reorder Point must be greater than or equal to 0").optional(),

    trackInventory: z.boolean().optional(),
    allowNegativeInventory: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.minimumStock !== undefined &&
      data.maximumStock !== undefined &&
      data.maximumStock < data.minimumStock
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum Stock must be greater than or equal to Minimum Stock",
        path: ["maximumStock"],
      });
    }
  });

/**
 * Validation schema for filtering/querying Products.
 */
export const productFilterSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (val === "true" || val === true) return true;
      if (val === "false" || val === false) return false;
      return undefined;
    })
    .optional(),
  sortBy: z
    .enum(["name", "sku", "sellingPrice", "createdAt", "updatedAt"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const CreateProductSchema = createProductSchema;
export const UpdateProductSchema = updateProductSchema;
export const ProductFilterSchema = productFilterSchema;

export type CreateProductInput = {
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
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type ProductFilterInput = {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  isActive?: boolean | string;
  sortBy?: "name" | "sku" | "sellingPrice" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};
