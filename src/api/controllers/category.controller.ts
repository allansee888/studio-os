import { Request, Response } from "express";
import { ZodError } from "zod";
import { categoryService, CategoryService, CategoryError } from "../services/category.service";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from "../../packages/validation/category.validation";

export class CategoryController {
  private service: CategoryService;

  constructor(service: CategoryService = categoryService) {
    this.service = service;
  }

  /**
   * GET /api/v1/catalog/categories
   * List categories with pagination, filtering, search, and tree support.
   */
  getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = categoryQuerySchema.parse(req.query);
      const result = await this.service.getCategories(query);
      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * GET /api/v1/catalog/categories/:id
   * Get category by ID.
   */
  getCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const category = await this.service.getCategory(id);
      return res.status(200).json({ data: category });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * POST /api/v1/catalog/categories
   * Create a new category.
   */
  createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const userId = req.user?.id;
      const category = await this.service.createCategory(validatedData, userId);
      return res.status(201).json({
        message: "Category created successfully",
        data: category,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * PUT /api/v1/catalog/categories/:id
   * Update an existing category.
   */
  updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const validatedData = updateCategorySchema.parse(req.body);
      const userId = req.user?.id;
      const category = await this.service.updateCategory(id, validatedData, userId);
      return res.status(200).json({
        message: "Category updated successfully",
        data: category,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/v1/catalog/categories/:id
   * Soft delete a category.
   */
  deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const result = await this.service.deleteCategory(id, userId);
      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * Map business and validation errors to HTTP responses.
   */
  private handleError(res: Response, error: any): Response {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => issue.message),
      });
    }
    if (error instanceof CategoryError) {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }
    console.error("[CategoryController] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const categoryController = new CategoryController();

export const getCategories = categoryController.getCategories;
export const getCategory = categoryController.getCategory;
export const createCategory = categoryController.createCategory;
export const updateCategory = categoryController.updateCategory;
export const deleteCategory = categoryController.deleteCategory;
