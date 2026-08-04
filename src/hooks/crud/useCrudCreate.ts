import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
  QueryKey,
} from "@tanstack/react-query";

export interface UseCrudCreateOptions<TData, TVariables> {
  fetcher: (data: TVariables) => Promise<TData>;
  invalidateQueryKeys?: QueryKey[];
  mutationOptions?: UseMutationOptions<TData, Error, TVariables>;
}

export function useCrudCreate<TData, TVariables>({
  fetcher,
  invalidateQueryKeys = [],
  mutationOptions,
}: UseCrudCreateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: (variables: TVariables) => fetcher(variables),
    onSuccess: (data, variables, context, mutation) => {
      invalidateQueryKeys.forEach((key) => {
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

export default useCrudCreate;
