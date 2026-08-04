import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

export interface UseCrudItemOptions<TData, TId = string> {
  id: TId;
  queryKey: QueryKey;
  fetcher: (id: TId) => Promise<TData>;
  enabled?: boolean;
  queryOptions?: Partial<UseQueryOptions<TData, Error, TData, QueryKey>>;
}

export function useCrudItem<TData, TId = string>({
  id,
  queryKey,
  fetcher,
  enabled,
  queryOptions,
}: UseCrudItemOptions<TData, TId>) {
  const isEnabled = enabled !== undefined ? enabled : Boolean(id);

  return useQuery<TData, Error>({
    queryKey,
    queryFn: () => fetcher(id),
    enabled: isEnabled,
    ...queryOptions,
  });
}

export default useCrudItem;
