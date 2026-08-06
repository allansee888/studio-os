import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import {
  brandApi,
  BrandListResponse,
  BrandSingleResponse,
  DeleteBrandResponse,
} from "../api/brand.api";
import {
  CreateBrandInput,
  UpdateBrandInput,
  BrandFilterInput,
} from "../../../packages/validation/brand";
import {
  useCrudList,
  useCrudItem,
  useCrudCreate,
  useCrudUpdate,
  useCrudDelete,
} from "../../../hooks/crud";
import { brandKeys } from "../api/brand.queryKeys";

/**
 * Hook for fetching paginated/filtered list of brands
 */
export function useBrands(
  params?: BrandFilterInput,
  options?: Partial<UseQueryOptions<BrandListResponse, Error>>
) {
  return useCrudList<BrandListResponse, BrandFilterInput>({
    queryKey: brandKeys.list(params),
    fetcher: (p) => brandApi.getBrands(p),
    params,
    queryOptions: options,
  });
}

/**
 * Hook for fetching a single brand by ID
 */
export function useBrand(
  id: string,
  options?: Partial<UseQueryOptions<BrandSingleResponse, Error>>
) {
  return useCrudItem<BrandSingleResponse, string>({
    id,
    queryKey: brandKeys.detail(id),
    fetcher: (brandId) => brandApi.getBrand(brandId),
    enabled: !!id,
    queryOptions: options,
  });
}

/**
 * Mutation hook for creating a new brand
 */
export function useCreateBrand(
  options?: UseMutationOptions<BrandSingleResponse, Error, CreateBrandInput>
) {
  return useCrudCreate<BrandSingleResponse, CreateBrandInput>({
    fetcher: (data) => brandApi.createBrand(data),
    invalidateQueryKeys: [brandKeys.all],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for updating an existing brand
 */
export function useUpdateBrand(
  options?: UseMutationOptions<
    BrandSingleResponse,
    Error,
    { id: string; data: UpdateBrandInput }
  >
) {
  return useCrudUpdate<
    BrandSingleResponse,
    { id: string; data: UpdateBrandInput }
  >({
    fetcher: ({ id, data }) => brandApi.updateBrand(id, data),
    invalidateQueryKeys: (_data, variables) => [
      brandKeys.all,
      brandKeys.detail(variables.id),
    ],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for deleting a brand
 */
export function useDeleteBrand(
  options?: UseMutationOptions<DeleteBrandResponse, Error, string>
) {
  return useCrudDelete<DeleteBrandResponse, string>({
    fetcher: (id) => brandApi.deleteBrand(id),
    invalidateQueryKeys: (_data, id) => [
      brandKeys.all,
      brandKeys.detail(id),
    ],
    mutationOptions: options,
  });
}
