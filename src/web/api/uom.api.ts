import {
  unitApi,
  UnitWithCount,
  UnitListResponse,
  UnitSingleResponse,
  DeleteUnitResponse,
} from "../../features/unit/unit.api";
import { UnitFilterInput } from "../../packages/validation/uom";
import { PaginationMeta } from "../../core/crud";

export type { PaginationMeta };

export type UomWithCount = UnitWithCount;
export type UomListResponse = UnitListResponse;
export type UomSingleResponse = UnitSingleResponse;
export type UomQueryParams = UnitFilterInput & { pageSize?: number };
export type DeleteUomResponse = DeleteUnitResponse;

export const uomApi = unitApi;

export const getUnits = unitApi.getUnits;
export const getUnit = unitApi.getUnit;
export const createUnit = unitApi.createUnit;
export const updateUnit = unitApi.updateUnit;
export const deleteUnit = unitApi.deleteUnit;

