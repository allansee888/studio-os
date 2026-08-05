import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import {
  unitApi,
  UnitListResponse,
  UnitSingleResponse,
  DeleteUnitResponse,
} from "./unit.api";
import {
  CreateUnitInput,
  UpdateUnitInput,
  UnitFilterInput,
} from "../../packages/validation/uom";
import {
  useCrudList,
  useCrudItem,
  useCrudCreate,
  useCrudUpdate,
  useCrudDelete,
} from "../../hooks/crud";
import { unitKeys } from "./unit.queryKeys";

export * from "./unit.api";
export * from "./unit.queryKeys";
export * from "./components/UnitForm";
export * from "./components/UnitDialog";
export * from "./components/UnitDeleteDialog";
export * from "./pages/UnitListPage";

/**
 * Hook for fetching paginated/filtered list of units
 */
export function useUnits(
  params?: UnitFilterInput,
  options?: Partial<UseQueryOptions<UnitListResponse, Error>>
) {
  return useCrudList<UnitListResponse, UnitFilterInput>({
    queryKey: unitKeys.list(params),
    fetcher: (p) => unitApi.getUnits(p),
    params,
    queryOptions: options,
  });
}

/**
 * Hook for fetching a single unit by ID
 */
export function useUnit(
  id: string,
  options?: Partial<UseQueryOptions<UnitSingleResponse, Error>>
) {
  return useCrudItem<UnitSingleResponse, string>({
    id,
    queryKey: unitKeys.detail(id),
    fetcher: (unitId) => unitApi.getUnit(unitId),
    enabled: !!id,
    queryOptions: options,
  });
}

/**
 * Mutation hook for creating a new unit
 */
export function useCreateUnit(
  options?: UseMutationOptions<UnitSingleResponse, Error, CreateUnitInput>
) {
  return useCrudCreate<UnitSingleResponse, CreateUnitInput>({
    fetcher: (data) => unitApi.createUnit(data),
    invalidateQueryKeys: [unitKeys.all],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for updating an existing unit
 */
export function useUpdateUnit(
  options?: UseMutationOptions<
    UnitSingleResponse,
    Error,
    { id: string; data: UpdateUnitInput }
  >
) {
  return useCrudUpdate<
    UnitSingleResponse,
    { id: string; data: UpdateUnitInput }
  >({
    fetcher: ({ id, data }) => unitApi.updateUnit(id, data),
    invalidateQueryKeys: (_data, variables) => [
      unitKeys.all,
      unitKeys.detail(variables.id),
    ],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for deleting a unit
 */
export function useDeleteUnit(
  options?: UseMutationOptions<DeleteUnitResponse, Error, string>
) {
  return useCrudDelete<DeleteUnitResponse, string>({
    fetcher: (id) => unitApi.deleteUnit(id),
    invalidateQueryKeys: (_data, id) => [
      unitKeys.all,
      unitKeys.detail(id),
    ],
    mutationOptions: options,
  });
}
