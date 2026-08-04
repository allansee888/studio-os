import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth";
import { requirePermission } from "../../middlewares/rbac";
import { CategoryService, CategoryError } from "../../services/categoryService";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "../../../packages/validation/category";
import { ZodError } from "zod";

const router = Router();

// Require authentication for all category endpoints
router.use(authenticate);

/**
 * GET /api/v1/categories/tree
 * Fetch hierarchical category tree
 */
router.get(
  "/tree",
  requirePermission("catalog.category.view"),
  async (req: Request, res: Response) => {
    try {
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      const tree = await CategoryService.getCategoryTree(isActive);
      return res.json({ data: tree });
    } catch (error: any) {
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/categories
 * List categories with pagination, search, sorting, filtering
 */
router.get(
  "/",
  requirePermission("catalog.category.view"),
  async (req: Request, res: Response) => {
    try {
      const query = categoryQuerySchema.parse(req.query);
      const result = await CategoryService.getCategories(query);
      return res.json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/categories/:id
 * Get category by ID
 */
router.get(
  "/:id",
  requirePermission("catalog.category.view"),
  async (req: Request, res: Response) => {
    try {
      const category = await CategoryService.getCategoryById(req.params.id);
      return res.json({ data: category });
    } catch (error: any) {
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/categories
 * Create category
 */
router.post(
  "/",
  requirePermission("catalog.category.create"),
  async (req: Request, res: Response) => {
    try {
      const input = createCategorySchema.parse(req.body);
      const category = await CategoryService.createCategory(input, req.user?.id);
      return res.status(201).json({ message: "Category created successfully", data: category });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT /api/v1/categories/:id
 * Update category
 */
router.put(
  "/:id",
  requirePermission("catalog.category.update"),
  async (req: Request, res: Response) => {
    try {
      const input = updateCategorySchema.parse(req.body);
      const category = await CategoryService.updateCategory(req.params.id, input, req.user?.id);
      return res.json({ message: "Category updated successfully", data: category });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/v1/categories/:id
 * Soft delete category
 */
router.delete(
  "/:id",
  requirePermission("catalog.category.delete"),
  async (req: Request, res: Response) => {
    try {
      const result = await CategoryService.deleteCategory(req.params.id, req.user?.id);
      return res.json(result);
    } catch (error: any) {
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
