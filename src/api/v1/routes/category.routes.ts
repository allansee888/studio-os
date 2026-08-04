import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { requireAnyPermission } from "../../middlewares/rbac";
import { validateBody, validateQuery } from "../../middlewares/validation";
import { categoryController } from "../../controllers/category.controller";
import { CategoryService, CategoryError } from "../../services/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "../../../packages/validation/category.validation";

const router = Router();

// 1. Authentication middleware applied to all category endpoints
router.use(authenticate);

/**
 * GET /api/v1/categories/tree
 * Shortcut endpoint for hierarchical tree structure
 */
router.get(
  "/tree",
  requireAnyPermission(["category.view", "catalog.category.view"]),
  async (req, res, next) => {
    try {
      const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
      const tree = await CategoryService.getCategoryTree(isActive);
      return res.status(200).json({ data: tree });
    } catch (error: any) {
      if (error instanceof CategoryError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      next(error);
    }
  }
);

/**
 * GET /api/v1/categories
 * List categories with pagination, search, sorting, filtering
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.get(
  "/",
  requireAnyPermission(["category.view", "catalog.category.view"]),
  validateQuery(categoryQuerySchema),
  categoryController.getCategories
);

/**
 * GET /api/v1/categories/:id
 * Get category by ID
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.get(
  "/:id",
  requireAnyPermission(["category.view", "catalog.category.view"]),
  categoryController.getCategory
);

/**
 * POST /api/v1/categories
 * Create a new category
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.post(
  "/",
  requireAnyPermission(["category.create", "catalog.category.create"]),
  validateBody(createCategorySchema),
  categoryController.createCategory
);

/**
 * PUT /api/v1/categories/:id
 * Update an existing category
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.put(
  "/:id",
  requireAnyPermission(["category.update", "catalog.category.update"]),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * DELETE /api/v1/categories/:id
 * Soft delete category
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.delete(
  "/:id",
  requireAnyPermission(["category.delete", "catalog.category.delete"]),
  categoryController.deleteCategory
);

export default router;
