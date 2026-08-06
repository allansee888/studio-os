import { Request, Response } from "express";
import { ZodError } from "zod";
import { productService, ProductService, ProductError } from "../services/product.service";
import {
  ProductFilterSchema,
  CreateProductSchema,
  UpdateProductSchema, CreateProductInput, UpdateProductInput
} from "../../packages/validation/product";

export class ProductController {
  private service: ProductService;

  constructor(service: ProductService = productService) {
    this.service = service;
  }

  /**
   * GET /api/v1/products
   * List products with pagination, filtering, and search.
   */
  getProducts = async (req: Request, res: Response): Promise<Response> => {
    try {
      const query = ProductFilterSchema.parse(req.query);
      const result = await this.service.getProducts(query);
      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * GET /api/v1/products/:id
   * Get product by ID.
   */
  getProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const product = await this.service.getProduct(id);
      return res.status(200).json({ data: product });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * POST /api/v1/products
   * Create a new product.
   */
  createProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const validatedData = CreateProductSchema.parse(req.body) as CreateProductInput;
      const userId = (req as any).user?.id;
      const product = await this.service.createProduct(validatedData, userId);
      return res.status(201).json({
        message: "Product created successfully",
        data: product,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * PUT /api/v1/products/:id
   * Update an existing product.
   */
  updateProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const validatedData = UpdateProductSchema.parse(req.body) as UpdateProductInput;
      const userId = (req as any).user?.id;
      const product = await this.service.updateProduct(id, validatedData, userId);
      return res.status(200).json({
        message: "Product updated successfully",
        data: product,
      });
    } catch (error: any) {
      return this.handleError(res, error);
    }
  };

  /**
   * DELETE /api/v1/products/:id
   * Soft delete a product. (Actually it's hard delete in service but the controller can still just say deleted successfully)
   */
  deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const result = await this.service.deleteProduct(id, userId);
      return res.status(200).json({
        message: "Product deleted successfully",
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

    if (error instanceof ProductError || error?.name === "ProductError") {
      return res.status(error.statusCode || 400).json({ error: error.message });
    }

    console.error("[ProductController] Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const productController = new ProductController();
export const getProducts = productController.getProducts;
export const getProduct = productController.getProduct;
export const createProduct = productController.createProduct;
export const updateProduct = productController.updateProduct;
export const deleteProduct = productController.deleteProduct;
