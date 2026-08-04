import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";

export interface UseCrudUpdateOptions<TData, TVariables> {
  fetcher: (variables: TVariables) => Promise<TData>;
  invalidateQueryKeys?:
    | QueryKey[]
    | ((data: TData, variables: TVariables) => QueryKey[]);
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
}

export function useCrudUpdate<TData, TVariables>({
  fetcher,
  invalidateQueryKeys = [],
  mutationOptions,
}: UseCrudUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: (variables: TVariables) => fetcher(variables),
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

export default useCrudUpdate;
