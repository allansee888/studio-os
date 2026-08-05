import { Request, Response } from "express";
import { ZodError } from "zod";
import { unitService, UnitService, UnitError } from "../services/unit.service";
import {
  UnitFilterSchema,
  CreateUnitSchema,
  UpdateUnitSchema,
} from "../../packages/validation/uom";

export class UnitController {
  private service: UnitService;

  constructor(service: UnitService = unitService) {
    this.service = service;
  }

  /**
   * GET /api/v1/units
   * List units of measure with pagination, filtering, and search.
   */
  getUnits = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = UnitFilterSchema.parse(req.query);
      const result = await this.service.getUnits(query);
      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * GET /api/v1/units/:id
   * Get unit of measure by ID.
   */
  getUnit = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const unit = await this.service.getUnit(id);
      return res.status(200).json({ data: unit });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * POST /api/v1/units
   * Create a new unit of measure.
   */
  createUnit = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData = CreateUnitSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const unit = await this.service.createUnit(validatedData, userId);
      return res.status(201).json({
        message: "Unit of Measure created successfully",
        data: unit,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * PUT /api/v1/units/:id
   * Update an existing unit of measure.
   */
  updateUnit = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const validatedData = UpdateUnitSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const unit = await this.service.updateUnit(id, validatedData, userId);
      return res.status(200).json({
        message: "Unit of Measure updated successfully",
        data: unit,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/v1/units/:id
   * Soft delete a unit of measure.
   */
  deleteUnit = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const result = await this.service.deleteUnit(id, userId);
      return res.status(200).json({
        message: "Unit of Measure deleted successfully",
        data: result,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * Map business and validation errors to HTTP responses.
   */
  private handleError(res: Response, error: any): Response {
    if (error instanceof ZodError || error?.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation failed",
        details: error instanceof ZodError ? error.issues.map((issue) => issue.message) : error.message,
      });
    }
    if (error?.name === "NotFoundError" || error?.statusCode === 404) {
      return res.status(404).json({ error: error.message || "Not found" });
    }
    if (error?.name === "ConflictError" || error?.statusCode === 409) {
      return res.status(409).json({ error: error.message || "Conflict error" });
    }
    if (error?.name === "UnauthorizedError" || error?.statusCode === 401) {
      return res.status(401).json({ error: error.message || "Unauthorized" });
    }
    if (error?.name === "ForbiddenError" || error?.statusCode === 403) {
      return res.status(403).json({ error: error.message || "Forbidden" });
    }
    if (error instanceof UnitError || error?.name === "UnitError" || error?.name === "UomError") {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
    console.error("[UnitController] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const unitController = new UnitController();

export const getUnits = unitController.getUnits;
export const getUnit = unitController.getUnit;
export const createUnit = unitController.createUnit;
export const updateUnit = unitController.updateUnit;
export const deleteUnit = unitController.deleteUnit;
