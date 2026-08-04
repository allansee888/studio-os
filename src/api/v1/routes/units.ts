import { Router, Request, Response } from "express";
import { authenticate } from "../../middlewares/auth";
import { requirePermission } from "../../middlewares/rbac";
import { UomService, UomError } from "../../services/uomService";
import {
  createUomSchema,
  updateUomSchema,
  uomQuerySchema,
} from "../../../packages/validation/uom";
import { ZodError } from "zod";

const router = Router();

// Require authentication for all UOM endpoints
router.use(authenticate);

/**
 * GET /api/v1/units
 * List units of measure with pagination, search, sorting, filtering
 */
router.get(
  "/",
  requirePermission("unit.view"),
  async (req: Request, res: Response) => {
    try {
      const query = uomQuerySchema.parse(req.query);
      const result = await UomService.getUnits(query);
      return res.json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof UomError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/v1/units/:id
 * Get unit of measure by ID
 */
router.get(
  "/:id",
  requirePermission("unit.view"),
  async (req: Request, res: Response) => {
    try {
      const unit = await UomService.getUnitById(req.params.id);
      return res.json({ data: unit });
    } catch (error: any) {
      if (error instanceof UomError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/v1/units
 * Create unit of measure
 */
router.post(
  "/",
  requirePermission("unit.create"),
  async (req: Request, res: Response) => {
    try {
      const input = createUomSchema.parse(req.body);
      const unit = await UomService.createUnit(input, req.user?.id);
      return res.status(201).json({ message: "Unit of Measure created successfully", data: unit });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof UomError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT /api/v1/units/:id
 * Update unit of measure
 */
router.put(
  "/:id",
  requirePermission("unit.update"),
  async (req: Request, res: Response) => {
    try {
      const input = updateUomSchema.parse(req.body);
      const unit = await UomService.updateUnit(req.params.id, input, req.user?.id);
      return res.json({ message: "Unit of Measure updated successfully", data: unit });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.issues.map((i) => i.message),
        });
      }
      if (error instanceof UomError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/v1/units/:id
 * Soft delete unit of measure
 */
router.delete(
  "/:id",
  requirePermission("unit.delete"),
  async (req: Request, res: Response) => {
    try {
      const deleted = await UomService.deleteUnit(req.params.id, req.user?.id);
      return res.json({ message: "Unit of Measure deleted successfully", data: deleted });
    } catch (error: any) {
      if (error instanceof UomError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
