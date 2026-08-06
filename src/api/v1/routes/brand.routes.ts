import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { requireAnyPermission } from "../../middlewares/rbac";
import { validateBody, validateQuery } from "../../middlewares/validation";
import { brandController } from "../../controllers/brand.controller";
import {
  BrandFilterSchema,
  CreateBrandSchema,
  UpdateBrandSchema,
} from "../../../packages/validation/brand";

const router = Router();

// 1. Authentication middleware applied to all Brand endpoints
router.use(authenticate);

/**
 * GET /api/v1/brands
 * List brands with pagination, search, sorting, filtering
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.get(
  "/",
  requireAnyPermission(["brand.view", "catalog.brand.view"]),
  validateQuery(BrandFilterSchema),
  brandController.getBrands
);

/**
 * GET /api/v1/brands/:id
 * Get brand by ID
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.get(
  "/:id",
  requireAnyPermission(["brand.view", "catalog.brand.view"]),
  brandController.getBrand
);

/**
 * POST /api/v1/brands
 * Create a new brand
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.post(
  "/",
  requireAnyPermission(["brand.create", "catalog.brand.create"]),
  validateBody(CreateBrandSchema),
  brandController.createBrand
);

/**
 * PUT /api/v1/brands/:id
 * Update an existing brand
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.put(
  "/:id",
  requireAnyPermission(["brand.update", "catalog.brand.update"]),
  validateBody(UpdateBrandSchema),
  brandController.updateBrand
);

/**
 * DELETE /api/v1/brands/:id
 * Soft delete brand
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.delete(
  "/:id",
  requireAnyPermission(["brand.delete", "catalog.brand.delete"]),
  brandController.deleteBrand
);

export default router;
