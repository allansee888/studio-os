export function cleanFilters<T extends Record<string, any>>(filters: T): Partial<T> {
  const cleaned: Partial<T> = {};
  for (const key of Object.keys(filters) as (keyof T)[]) {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== "" && value !== "undefined" && value !== "null") {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export function buildSearchFilters(search?: string, fields: string[] = ["name", "code"]) {
  if (!search || typeof search !== "string" || !search.trim()) {
    return null;
  }
  const query = search.trim();
  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: query,
        mode: "insensitive" as const,
      },
    })),
  };
}
