export function normalizePage(page?: number | string, defaultPage = 1): number {
  if (page === undefined || page === null || page === "") return defaultPage;
  const parsed = typeof page === "string" ? parseInt(page, 10) : page;
  return isNaN(parsed) || parsed < 1 ? defaultPage : Math.floor(parsed);
}

export function normalizePageSize(
  pageSize?: number | string,
  defaultSize = 10,
  maxLimit = 100
): number {
  if (pageSize === undefined || pageSize === null || pageSize === "") return defaultSize;
  const parsed = typeof pageSize === "string" ? parseInt(pageSize, 10) : pageSize;
  if (isNaN(parsed) || parsed < 1) return defaultSize;
  return Math.min(Math.floor(parsed), maxLimit);
}

export function buildPagination(
  page?: number | string,
  pageSize?: number | string,
  defaultPage = 1,
  defaultSize = 10
) {
  const normalizedPage = normalizePage(page, defaultPage);
  const normalizedLimit = normalizePageSize(pageSize, defaultSize);
  const skip = (normalizedPage - 1) * normalizedLimit;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    pageSize: normalizedLimit,
    skip,
    offset: skip,
  };
}
