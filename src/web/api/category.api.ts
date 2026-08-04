import { apiFetch } from "../utils/api";
import { Category } from "../../packages/types/domain";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../packages/validation/category.validation";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategoryListResponse {
  items: Category[];
  pagination: PaginationMeta;
}

export interface CategorySingleResponse {
  data: Category;
}

export interface CategoryTreeResponse {
  data: Category[];
}

export interface CategoryQueryParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  parentId?: string | null;
  parentCategoryId?: string | null;
  includeChildren?: boolean;
  tree?: boolean;
  sortBy?: "name" | "code" | "displayOrder" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface DeleteCategoryResponse {
  message: string;
  id: string;
}

export const categoryApi = {
  /**
   * Fetch paginated list of categories with filtering, search, and sorting.
   */
  async getCategories(params: CategoryQueryParams = {}): Promise<CategoryListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.set("page", String(params.page));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params.pageSize !== undefined) queryParams.set("pageSize", String(params.pageSize));
    if (params.search) queryParams.set("search", params.search);
    if (params.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
    if (params.parentId) queryParams.set("parentId", params.parentId);
    if (params.parentCategoryId) queryParams.set("parentCategoryId", params.parentCategoryId);
    if (params.includeChildren !== undefined) queryParams.set("includeChildren", String(params.includeChildren));
    if (params.tree !== undefined) queryParams.set("tree", String(params.tree));
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/api/v1/categories${queryString ? `?${queryString}` : ""}`;

    return apiFetch<CategoryListResponse>(url);
  },

  /**
   * Fetch a single category by ID.
   */
  async getCategory(id: string): Promise<CategorySingleResponse> {
    return apiFetch<CategorySingleResponse>(`/api/v1/categories/${id}`);
  },

  /**
   * Create a new category.
   */
  async createCategory(data: CreateCategoryInput): Promise<CategorySingleResponse> {
    return apiFetch<CategorySingleResponse>("/api/v1/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing category.
   */
  async updateCategory(id: string, data: UpdateCategoryInput): Promise<CategorySingleResponse> {
    return apiFetch<CategorySingleResponse>(`/api/v1/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a category by ID.
   */
  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    return apiFetch<DeleteCategoryResponse>(`/api/v1/categories/${id}`, {
      method: "DELETE",
    });
  },
};

export const getCategories = categoryApi.getCategories;
export const getCategory = categoryApi.getCategory;
export const createCategory = categoryApi.createCategory;
export const updateCategory = categoryApi.updateCategory;
export const deleteCategory = categoryApi.deleteCategory;
