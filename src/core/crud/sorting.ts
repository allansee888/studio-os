export type SortOrder = "asc" | "desc";

export function normalizeSort<T extends string = string>(
  sortBy?: T | string,
  sortOrder?: string
): { sortBy?: T; sortOrder: SortOrder } {
  const normalizedOrder: SortOrder =
    sortOrder?.toLowerCase() === "asc" ? "asc" : "desc";
  return {
    sortBy: sortBy as T | undefined,
    sortOrder: normalizedOrder,
  };
}

export function buildSort<T extends string = string>(
  sortBy?: T | string,
  sortOrder?: SortOrder | string,
  defaultSortBy = "createdAt",
  defaultOrder: SortOrder = "desc"
) {
  const field = (sortBy || defaultSortBy) as T | string;
  const order: SortOrder =
    sortOrder?.toLowerCase() === "asc" ? "asc" : sortOrder?.toLowerCase() === "desc" ? "desc" : defaultOrder;

  return {
    sortBy: field,
    sortOrder: order,
    orderBy: {
      [field]: order,
    },
  };
}
