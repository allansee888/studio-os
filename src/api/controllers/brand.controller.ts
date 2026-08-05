import { Request, Response } from "express";
import { ZodError } from "zod";
import { brandService, BrandService, BrandError } from "../services/brand.service";
import {
  BrandFilterSchema,
  CreateBrandSchema,
  UpdateBrandSchema,
} from "../../packages/validation/brand";

export class BrandController {
  private service: BrandService;

  constructor(service: BrandService = brandService) {
    this.service = service;
  }

  /**
   * GET /api/v1/catalog/brands
   * List brands with pagination, filtering, and search.
   */
  getBrands = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = BrandFilterSchema.parse(req.query);
      const result = await this.service.getBrands(query);
      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * GET /api/v1/catalog/brands/:id
   * Get brand by ID.
   */
  getBrand = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const brand = await this.service.getBrand(id);
      return res.status(200).json({ data: brand });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * POST /api/v1/catalog/brands
   * Create a new brand.
   */
  createBrand = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData = CreateBrandSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const brand = await this.service.createBrand(validatedData, userId);
      return res.status(201).json({
        message: "Brand created successfully",
        data: brand,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * PUT /api/v1/catalog/brands/:id
   * Update an existing brand.
   */
  updateBrand = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const validatedData = UpdateBrandSchema.parse(req.body);
      const userId = (req as any).user?.id;
      const brand = await this.service.updateBrand(id, validatedData, userId);
      return res.status(200).json({
        message: "Brand updated successfully",
        data: brand,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/v1/catalog/brands/:id
   * Soft delete a brand.
   */
  deleteBrand = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const result = await this.service.deleteBrand(id, userId);
      return res.status(200).json({
        message: "Brand deleted successfully",
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
    if (error instanceof BrandError || error?.name === "BrandError") {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
    console.error("[BrandController] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const brandController = new BrandController();

export const getBrands = brandController.getBrands;
export const getBrand = brandController.getBrand;
export const createBrand = brandController.createBrand;
export const updateBrand = brandController.updateBrand;
export const deleteBrand = brandController.deleteBrand;
