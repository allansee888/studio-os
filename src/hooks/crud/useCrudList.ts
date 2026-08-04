import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

export interface UseCrudListOptions<TData, TParams = Record<string, unknown>> {
  queryKey: QueryKey;
  fetcher: (params?: TParams) => Promise<TData>;
  params?: TParams;
  queryOptions?: Partial<UseQueryOptions<TData, Error, TData, QueryKey>>;
}

export function useCrudList<TData, TParams = Record<string, unknown>>({
  queryKey,
  fetcher,
  params,
  queryOptions,
}: UseCrudListOptions<TData, TParams>) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => fetcher(params),
    ...queryOptions,
  });
}

export default useCrudList;
