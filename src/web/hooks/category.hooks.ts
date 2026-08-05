import {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import {
  categoryApi,
  CategoryQueryParams,
  CategoryListResponse,
  CategorySingleResponse,
  DeleteCategoryResponse,
} from "../api/category.api";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../../packages/validation/category.validation";
import {
  useCrudList,
  useCrudItem,
  useCrudCreate,
  useCrudUpdate,
  useCrudDelete,
} from "../../hooks/crud";
import { createCrudQueryKeys } from "../../core/crud";

/**
 * Standardized Query Key Factory for Category queries
 */
export const categoryKeys = createCrudQueryKeys("categories");

/**
 * Hook for fetching paginated/filtered list of categories
 */
export function useCategories(
  params?: CategoryQueryParams,
  options?: Partial<UseQueryOptions<CategoryListResponse, Error>>
) {
  return useCrudList<CategoryListResponse, CategoryQueryParams>({
    queryKey: categoryKeys.list(params),
    fetcher: (p) => categoryApi.getCategories(p),
    params,
    queryOptions: options,
  });
}

/**
 * Hook for fetching a single category by ID
 */
export function useCategory(
  id: string,
  options?: Partial<UseQueryOptions<CategorySingleResponse, Error>>
) {
  return useCrudItem<CategorySingleResponse, string>({
    id,
    queryKey: categoryKeys.detail(id),
    fetcher: (catId) => categoryApi.getCategory(catId),
    enabled: !!id,
    queryOptions: options,
  });
}

/**
 * Mutation hook for creating a new category
 */
export function useCreateCategory(
  options?: UseMutationOptions<CategorySingleResponse, Error, CreateCategoryInput>
) {
  return useCrudCreate<CategorySingleResponse, CreateCategoryInput>({
    fetcher: (data) => categoryApi.createCategory(data),
    invalidateQueryKeys: [categoryKeys.all],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for updating an existing category
 */
export function useUpdateCategory(
  options?: UseMutationOptions<
    CategorySingleResponse,
    Error,
    { id: string; data: UpdateCategoryInput }
  >
) {
  return useCrudUpdate<
    CategorySingleResponse,
    { id: string; data: UpdateCategoryInput }
  >({
    fetcher: ({ id, data }) => categoryApi.updateCategory(id, data),
    invalidateQueryKeys: (_data, variables) => [
      categoryKeys.all,
      categoryKeys.detail(variables.id),
    ],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategory(
  options?: UseMutationOptions<DeleteCategoryResponse, Error, string>
) {
  return useCrudDelete<DeleteCategoryResponse, string>({
    fetcher: (id) => categoryApi.deleteCategory(id),
    invalidateQueryKeys: [categoryKeys.all],
    mutationOptions: options,
  });
}
