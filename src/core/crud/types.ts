export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | string | null;
}

export interface CrudFilters {
  search?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface CrudPagination {
  page?: number;
  pageSize?: number;
  limit?: number;
}

export interface CrudSort<TSortBy extends string = string> {
  sortBy?: TSortBy;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CrudMutationResult<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  id?: string;
}
