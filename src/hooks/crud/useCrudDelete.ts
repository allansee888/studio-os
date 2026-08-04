import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";

export interface UseCrudDeleteOptions<TData, TId = string> {
  fetcher: (id: TId) => Promise<TData>;
  invalidateQueryKeys?:
    | QueryKey[]
    | ((data: TData, id: TId) => QueryKey[]);
  mutationOptions?: UseMutationOptions<TData, Error, TId>;
}

export function useCrudDelete<TData, TId = string>({
  fetcher,
  invalidateQueryKeys = [],
  mutationOptions,
}: UseCrudDeleteOptions<TData, TId>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TId>({
    ...mutationOptions,
    mutationFn: (id: TId) => fetcher(id),
    onSuccess: (data, variables, context, mutation) => {
      const keysToInvalidate =
        typeof invalidateQueryKeys === "function"
          ? invalidateQueryKeys(data, variables)
          : invalidateQueryKeys;

      keysToInvalidate.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });

      if (mutationOptions?.onSuccess) {
        mutationOptions.onSuccess(data, variables, context, mutation);
      }
    },
    onError: (error, variables, context, mutation) => {
      if (mutationOptions?.onError) {
        mutationOptions.onError(error, variables, context, mutation);
      }
    },
  });
}

export default useCrudDelete;
