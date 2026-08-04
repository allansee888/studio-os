import {
  useQuery,
  useMutation,
  useQueryClient,
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

/**
 * Standardized Query Key Factory for Category queries
 */
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: CategoryQueryParams) => [...categoryKeys.lists(), params ?? {}] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

/**
 * Hook for fetching paginated/filtered list of categories
 */
export function useCategories(
  params?: CategoryQueryParams,
  options?: Partial<UseQueryOptions<CategoryListResponse, Error>>
) {
  return useQuery<CategoryListResponse, Error>({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getCategories(params),
    ...options,
  });
}

/**
 * Hook for fetching a single category by ID
 */
export function useCategory(
  id: string,
  options?: Partial<UseQueryOptions<CategorySingleResponse, Error>>
) {
  return useQuery<CategorySingleResponse, Error>({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Mutation hook for creating a new category
 */
export function useCreateCategory(
  options?: UseMutationOptions<CategorySingleResponse, Error, CreateCategoryInput>
) {
  const queryClient = useQueryClient();

  return useMutation<CategorySingleResponse, Error, CreateCategoryInput>({
    ...options,
    mutationFn: (data: CreateCategoryInput) => categoryApi.createCategory(data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      if (options?.onSuccess) {
        (options.onSuccess as any)(data, variables, context);
      }
    },
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
  const queryClient = useQueryClient();

  return useMutation<CategorySingleResponse, Error, { id: string; data: UpdateCategoryInput }>({
    ...options,
    mutationFn: ({ id, data }) => categoryApi.updateCategory(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) });
      if (options?.onSuccess) {
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

/**
 * Mutation hook for deleting a category
 */
export function useDeleteCategory(
  options?: UseMutationOptions<DeleteCategoryResponse, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation<DeleteCategoryResponse, Error, string>({
    ...options,
    mutationFn: (id: string) => categoryApi.deleteCategory(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      if (options?.onSuccess) {
        (options.onSuccess as any)(data, variables, context);
      }
    },
  });
}

