import { apiFetch } from "../../../web/utils/api";
import { Product } from "../../../packages/types/domain";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
} from "../../../packages/validation/product";
import { PaginatedResponse } from "../../../core/crud";

export type ProductListResponse = PaginatedResponse<Product>;

export interface ProductSingleResponse {
  data: Product;
}

export interface DeleteProductResponse {
  message: string;
  data?: any;
}

export const productApi = {
  /**
   * Fetch paginated list of products with filtering, search, and sorting.
   */
  async getProducts(params: ProductFilterInput = {}): Promise<ProductListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.set("page", String(params.page));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params.search) queryParams.set("search", params.search);
    if (params.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
    if (params.categoryId) queryParams.set("categoryId", params.categoryId);
    if (params.brandId) queryParams.set("brandId", params.brandId);
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);
    
    const queryString = queryParams.toString();
    const url = `/api/v1/products${queryString ? `?${queryString}` : ""}`;
    return apiFetch<ProductListResponse>(url);
  },

  /**
   * Fetch a single product by ID.
   */
  async getProduct(id: string): Promise<ProductSingleResponse> {
    return apiFetch<ProductSingleResponse>(`/api/v1/products/${id}`);
  },

  /**
   * Create a new product.
   */
  async createProduct(data: CreateProductInput): Promise<ProductSingleResponse> {
    return apiFetch<ProductSingleResponse>("/api/v1/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing product.
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<ProductSingleResponse> {
    return apiFetch<ProductSingleResponse>(`/api/v1/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a product by ID.
   */
  async deleteProduct(id: string): Promise<DeleteProductResponse> {
    return apiFetch<DeleteProductResponse>(`/api/v1/products/${id}`, {
      method: "DELETE",
    });
  },
};

export const getProducts = productApi.getProducts;
export const getProduct = productApi.getProduct;
export const createProduct = productApi.createProduct;
export const updateProduct = productApi.updateProduct;
export const deleteProduct = productApi.deleteProduct;
