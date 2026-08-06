import { UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import {
  productApi,
  ProductListResponse,
  ProductSingleResponse,
  DeleteProductResponse,
} from "../api/product.api";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
} from "../../../packages/validation/product";
import {
  useCrudList,
  useCrudItem,
  useCrudCreate,
  useCrudUpdate,
  useCrudDelete,
} from "../../../hooks/crud";
import { productKeys } from "../api/product.queryKeys";

/**
 * Hook for fetching paginated/filtered list of products
 */
export function useProducts(
  params?: ProductFilterInput,
  options?: Partial<UseQueryOptions<ProductListResponse, Error>>
) {
  return useCrudList<ProductListResponse, ProductFilterInput>({
    queryKey: productKeys.list(params),
    fetcher: (p) => productApi.getProducts(p),
    params,
    queryOptions: options,
  });
}

/**
 * Hook for fetching a single product by ID
 */
export function useProduct(
  id: string,
  options?: Partial<UseQueryOptions<ProductSingleResponse, Error>>
) {
  return useCrudItem<ProductSingleResponse, string>({
    id,
    queryKey: productKeys.detail(id),
    fetcher: (productId) => productApi.getProduct(productId),
    enabled: !!id,
    queryOptions: options,
  });
}

/**
 * Mutation hook for creating a new product
 */
export function useCreateProduct(
  options?: UseMutationOptions<ProductSingleResponse, Error, CreateProductInput>
) {
  return useCrudCreate<ProductSingleResponse, CreateProductInput>({
    fetcher: (data) => productApi.createProduct(data),
    invalidateQueryKeys: [productKeys.all],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for updating an existing product
 */
export function useUpdateProduct(
  options?: UseMutationOptions<
    ProductSingleResponse,
    Error,
    { id: string; data: UpdateProductInput }
  >
) {
  return useCrudUpdate<
    ProductSingleResponse,
    { id: string; data: UpdateProductInput }
  >({
    fetcher: ({ id, data }) => productApi.updateProduct(id, data),
    invalidateQueryKeys: (_data, variables) => [
      productKeys.all,
      productKeys.detail(variables.id),
    ],
    mutationOptions: options,
  });
}

/**
 * Mutation hook for deleting a product
 */
export function useDeleteProduct(
  options?: UseMutationOptions<DeleteProductResponse, Error, string>
) {
  return useCrudDelete<DeleteProductResponse, string>({
    fetcher: (id) => productApi.deleteProduct(id),
    invalidateQueryKeys: (_data, id) => [
      productKeys.all,
      productKeys.detail(id),
    ],
    mutationOptions: options,
  });
}
