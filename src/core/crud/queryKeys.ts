export function list(entity: string, params?: unknown) {
  return [entity, "list", params ?? {}] as const;
}

export function detail(entity: string, id: string | number) {
  return [entity, "detail", id] as const;
}

export function create(entity: string) {
  return [entity, "create"] as const;
}

export function update(entity: string, id?: string | number) {
  return [entity, "update", id ?? "all"] as const;
}

export function remove(entity: string, id?: string | number) {
  return [entity, "delete", id ?? "all"] as const;
}

export { remove as delete };

export const crudQueryKeys = {
  list,
  detail,
  create,
  update,
  delete: remove,
};

export function createCrudQueryKeys(entity: string) {
  const all = [entity] as const;
  return {
    all,
    lists: () => [...all, "list"] as const,
    list: (params?: unknown) => [...all, "list", params ?? {}] as const,
    details: () => [...all, "detail"] as const,
    detail: (id: string | number) => [...all, "detail", id] as const,
    create: () => [...all, "create"] as const,
    update: (id?: string | number) => [...all, "update", id ?? "all"] as const,
    delete: (id?: string | number) => [...all, "delete", id ?? "all"] as const,
  };
}
