import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { requireAnyPermission } from "../../middlewares/rbac";
import { validateBody, validateQuery } from "../../middlewares/validation";
import { productController } from "../../controllers/product.controller";
import {
  ProductFilterSchema,
  CreateProductSchema,
  UpdateProductSchema,
} from "../../../packages/validation/product";

const router = Router();

// 1. Authentication middleware applied to all Product endpoints
router.use(authenticate);

/**
 * GET /api/v1/products
 * List products with pagination, search, sorting, filtering
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.get(
  "/",
  requireAnyPermission(["product.view", "catalog.product.view"]),
  validateQuery(ProductFilterSchema),
  productController.getProducts
);

/**
 * GET /api/v1/products/:id
 * Get product by ID
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.get(
  "/:id",
  requireAnyPermission(["product.view", "catalog.product.view"]),
  productController.getProduct
);

/**
 * POST /api/v1/products
 * Create a new product
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.post(
  "/",
  requireAnyPermission(["product.create", "catalog.product.create"]),
  validateBody(CreateProductSchema),
  productController.createProduct
);

/**
 * PUT /api/v1/products/:id
 * Update an existing product
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.put(
  "/:id",
  requireAnyPermission(["product.update", "catalog.product.update"]),
  validateBody(UpdateProductSchema),
  productController.updateProduct
);

/**
 * DELETE /api/v1/products/:id
 * Delete product
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.delete(
  "/:id",
  requireAnyPermission(["product.delete", "catalog.product.delete"]),
  productController.deleteProduct
);

export default router;
