import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { requireAnyPermission } from "../../middlewares/rbac";
import { validateBody, validateQuery } from "../../middlewares/validation";
import { unitController } from "../../controllers/unit.controller";
import {
  CreateUnitSchema,
  UpdateUnitSchema,
  UnitFilterSchema,
} from "../../../packages/validation/uom";

const router = Router();

// 1. Authentication middleware applied to all Unit endpoints
router.use(authenticate);

/**
 * GET /api/v1/units
 * List units of measure with pagination, search, sorting, filtering
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.get(
  "/",
  requireAnyPermission(["unit.view", "catalog.unit.view"]),
  validateQuery(UnitFilterSchema),
  unitController.getUnits
);

/**
 * GET /api/v1/units/:id
 * Get unit of measure by ID
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.get(
  "/:id",
  requireAnyPermission(["unit.view", "catalog.unit.view"]),
  unitController.getUnit
);

/**
 * POST /api/v1/units
 * Create a new unit of measure
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.post(
  "/",
  requireAnyPermission(["unit.create", "catalog.unit.create"]),
  validateBody(CreateUnitSchema),
  unitController.createUnit
);

/**
 * PUT /api/v1/units/:id
 * Update an existing unit of measure
 * Middleware order: Authentication -> RBAC -> Validation -> Controller
 */
router.put(
  "/:id",
  requireAnyPermission(["unit.update", "catalog.unit.update"]),
  validateBody(UpdateUnitSchema),
  unitController.updateUnit
);

/**
 * DELETE /api/v1/units/:id
 * Soft delete unit of measure
 * Middleware order: Authentication -> RBAC -> Controller
 */
router.delete(
  "/:id",
  requireAnyPermission(["unit.delete", "catalog.unit.delete"]),
  unitController.deleteUnit
);

export default router;
