import { apiFetch } from "../../web/utils/api";
import { UnitOfMeasure } from "../../packages/types/domain";
import {
  CreateUnitInput,
  UpdateUnitInput,
  UnitFilterInput,
} from "../../packages/validation/uom";
import { PaginatedResponse } from "../../core/crud";

export type UnitWithCount = UnitOfMeasure & { itemsCount?: number };

export type UnitListResponse = PaginatedResponse<UnitWithCount>;

export interface UnitSingleResponse {
  data: UnitWithCount;
}

export interface DeleteUnitResponse {
  message: string;
  data?: any;
}

export const unitApi = {
  /**
   * Fetch paginated list of units with filtering, search, and sorting.
   */
  async getUnits(params: UnitFilterInput = {}): Promise<UnitListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.set("page", String(params.page));
    if (params.limit !== undefined) queryParams.set("limit", String(params.limit));
    if (params.search) queryParams.set("search", params.search);
    if (params.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

    const queryString = queryParams.toString();
    const url = `/api/v1/units${queryString ? `?${queryString}` : ""}`;

    return apiFetch<UnitListResponse>(url);
  },

  /**
   * Fetch a single unit by ID.
   */
  async getUnit(id: string): Promise<UnitSingleResponse> {
    return apiFetch<UnitSingleResponse>(`/api/v1/units/${id}`);
  },

  /**
   * Create a new unit.
   */
  async createUnit(data: CreateUnitInput): Promise<UnitSingleResponse> {
    return apiFetch<UnitSingleResponse>("/api/v1/units", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing unit.
   */
  async updateUnit(id: string, data: UpdateUnitInput): Promise<UnitSingleResponse> {
    return apiFetch<UnitSingleResponse>(`/api/v1/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a unit by ID.
   */
  async deleteUnit(id: string): Promise<DeleteUnitResponse> {
    return apiFetch<DeleteUnitResponse>(`/api/v1/units/${id}`, {
      method: "DELETE",
    });
  },
};

export const getUnits = unitApi.getUnits;
export const getUnit = unitApi.getUnit;
export const createUnit = unitApi.createUnit;
export const updateUnit = unitApi.updateUnit;
export const deleteUnit = unitApi.deleteUnit;
