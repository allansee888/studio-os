import { apiFetch } from "../../../web/utils/api";
import { Brand } from "../../../packages/types/domain";
import {
  CreateBrandInput,
  UpdateBrandInput,
  BrandFilterInput,
} from "../../../packages/validation/brand";
import { PaginatedResponse } from "../../../core/crud";

export type BrandWithCount = Brand & { itemsCount?: number };
export type BrandListResponse = PaginatedResponse<BrandWithCount>;

export interface BrandSingleResponse {
  data: BrandWithCount;
}

export interface DeleteBrandResponse {
  message: string;
  data?: any;
}

export const brandApi = {
  /**
   * Fetch paginated list of brands with filtering, search, and sorting.
   */
  async getBrands(params: BrandFilterInput = {}): Promise<BrandListResponse> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set("page", String(params.page));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params.search) queryParams.set("search", params.search);
    if (params.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/api/v1/brands${queryString ? `?${queryString}` : ""}`;

    return apiFetch<BrandListResponse>(url);
  },

  /**
   * Fetch a single brand by ID.
   */
  async getBrand(id: string): Promise<BrandSingleResponse> {
    return apiFetch<BrandSingleResponse>(`/api/v1/brands/${id}`);
  },

  /**
   * Create a new brand.
   */
  async createBrand(data: CreateBrandInput): Promise<BrandSingleResponse> {
    return apiFetch<BrandSingleResponse>("/api/v1/brands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing brand.
   */
  async updateBrand(id: string, data: UpdateBrandInput): Promise<BrandSingleResponse> {
    return apiFetch<BrandSingleResponse>(`/api/v1/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a brand by ID.
   */
  async deleteBrand(id: string): Promise<DeleteBrandResponse> {
    return apiFetch<DeleteBrandResponse>(`/api/v1/brands/${id}`, {
      method: "DELETE",
    });
  },
};

export const getBrands = brandApi.getBrands;
export const getBrand = brandApi.getBrand;
export const createBrand = brandApi.createBrand;
export const updateBrand = brandApi.updateBrand;
export const deleteBrand = brandApi.deleteBrand;
