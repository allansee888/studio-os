# StudioOS Shared CRUD Framework Documentation

## Overview

The **StudioOS Shared CRUD Framework** provides a standardized, fully-typed, domain-agnostic foundation for building master-data and transactional CRUD modules across the StudioOS platform.

By separating core data utilities, generic React Query hooks, and modular UI components from domain-specific business logic, StudioOS enables rapid, consistent, and maintainable module development.

---

## Folder Structure

```
src/
├── core/
│   └── crud/                         # Core Utilities & Types
│       ├── types.ts                  # BaseEntity, CrudFilters, CrudPagination, etc.
│       ├── queryKeys.ts              # Typed query key factories & helpers
│       ├── pagination.ts             # Pagination normalization & offset calculators
│       ├── sorting.ts                # Sort normalization & Prisma orderBy builders
│       ├── filters.ts                # Filter cleaning & search builders
│       ├── responses.ts              # Standardized API response models
│       └── index.ts                  # Core barrel export
├── hooks/
│   └── crud/                         # Generic React Query Hooks
│       ├── useCrudList.ts            # Paginated & filtered list query hook
│       ├── useCrudItem.ts            # Single item detail query hook
│       ├── useCrudCreate.ts          # Creation mutation hook with query invalidation
│       ├── useCrudUpdate.ts          # Update mutation hook with query invalidation
│       ├── useCrudDelete.ts          # Deletion mutation hook with query invalidation
│       └── index.ts                  # Hooks barrel export
├── components/
│   └── crud/                         # Shared Domain-Agnostic UI Components
│       ├── CrudPage.tsx              # Page layout shell (title, actions, breadcrumbs)
│       ├── CrudToolbar.tsx           # Search, filter, view mode, and refresh controls
│       ├── CrudTable.tsx             # Flexible DataGrid with column configurations
│       ├── CrudPagination.tsx        # Page controls, size selector, info display
│       ├── CrudStatusBadge.tsx       # Status indicator badge (active, inactive, etc.)
│       ├── CrudEmptyState.tsx        # Empty result placeholder with action button
│       ├── CrudLoadingState.tsx      # Skeleton loader for table and grid layouts
│       ├── CrudErrorState.tsx        # Error boundary placeholder with retry button
│       ├── CrudDeleteDialog.tsx      # Confirmation dialog for item deletion
│       └── index.ts                  # Components barrel export
└── web/
    ├── api/                          # Frontend API Clients (e.g. category.api.ts)
    ├── hooks/                        # Feature Hooks using useCrud* (e.g. category.hooks.ts)
    └── components/                   # Feature Modals/Forms (e.g. categories/)
```

---

## Architecture Principles

1. **Domain-Agnostic UI**: UI components (`CrudTable`, `CrudPage`, `CrudDeleteDialog`) render data dynamically via configuration objects without hardcoding domain field names.
2. **Type Safety with TypeScript Generics**: Every layer uses strict TypeScript generics (`TData`, `TVariables`, `TFilters`, `TSortBy`) to eliminate `any` types while preserving autocompletion.
3. **Declarative Invalidation**: Mutations accept query key factories (`invalidateQueryKeys`) to automatically purge stale React Query caches on successful operations.
4. **Standardized Query Keys**: Every module defines a query key factory using `createCrudQueryKeys(entityName)` to enforce hierarchical cache key structures.
5. **Separation of Concerns**:
   - Backend: Controller -> Service -> Repository -> Database
   - Frontend API: HTTP Client (`apiClient`) -> Entity API Client
   - Frontend Hooks: Generic CRUD Hooks (`useCrudList`, etc.) -> Feature Hooks (`useCategories`, etc.)
   - Frontend UI: Shared CRUD UI Components -> Feature Pages (`CategoriesPage`)

---

## CRUD Lifecycle & Query Keys

### Standard Query Key Hierarchy

Query keys follow a structured tuple format:
- All queries: `[entity]` (e.g. `["categories"]`)
- Lists: `[entity, "list", params]` (e.g. `["categories", "list", { page: 1, search: "photo" }]`)
- Detail: `[entity, "detail", id]` (e.g. `["categories", "detail", "cat-123"]`)

### Lifecycle Flow

1. **Read Operations**: `useCrudList` or `useCrudItem` executes `useQuery` with the entity's query key.
2. **Write Operations**: `useCrudCreate`, `useCrudUpdate`, or `useCrudDelete` executes `useMutation`.
3. **Cache Invalidation**: On mutation success, the hook automatically invalidates configured query keys (e.g., `categoryKeys.all` or `categoryKeys.detail(id)`), triggering background refetches for all active subscriptions.

---

## Shared CRUD Core Utilities (`@core/crud`)

### Core Types (`types.ts`)
- `BaseEntity`: Standard fields (`id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`).
- `CrudFilters`: Common filter shape (`search`, `isActive`, etc.).
- `CrudPagination`: Page and limit parameters.
- `CrudSort<TSortBy>`: Sort field and direction (`asc` | `desc`).
- `PaginatedResult<T>`: Paginated response wrapping `items` and `pagination` metadata.
- `CrudMutationResult<T>`: Standard response for CUD operations.

### Query Key Factory (`queryKeys.ts`)
```ts
import { createCrudQueryKeys } from "@/core/crud";

export const categoryKeys = createCrudQueryKeys("categories");
// Generates:
// categoryKeys.all -> ["categories"]
// categoryKeys.list(params) -> ["categories", "list", params]
// categoryKeys.detail(id) -> ["categories", "detail", id]
```

### Pagination Helpers (`pagination.ts`)
- `normalizePage(page, defaultPage)`: Ensures page is a positive integer >= 1.
- `normalizePageSize(pageSize, defaultSize, maxLimit)`: Caps page size safely.
- `buildPagination(page, pageSize)`: Calculates `skip`/`offset` and normalized limits.

### Sorting Helpers (`sorting.ts`)
- `normalizeSort(sortBy, sortOrder)`: Normalizes sort direction to `"asc"` or `"desc"`.
- `buildSort(sortBy, sortOrder, defaultSortBy)`: Generates Prisma-compatible `orderBy` objects.

### Filter Helpers (`filters.ts`)
- `cleanFilters(filters)`: Removes `undefined`, `null`, and empty strings from query parameters.
- `buildSearchFilters(search, fields)`: Constructs multi-field case-insensitive search queries.

---

## Generic React Query Hooks (`@hooks/crud`)

### `useCrudList<TData, TParams>`
Fetches a list of records based on query parameters.
```ts
const { data, isLoading, isError, refetch } = useCrudList<CategoryListResponse, CategoryQueryParams>({
  queryKey: categoryKeys.list(params),
  fetcher: (p) => categoryApi.getCategories(p),
  params,
});
```

### `useCrudItem<TData, TId>`
Fetches a single record by ID.
```ts
const { data, isLoading } = useCrudItem<CategorySingleResponse, string>({
  id,
  queryKey: categoryKeys.detail(id),
  fetcher: (catId) => categoryApi.getCategory(catId),
  enabled: !!id,
});
```

### `useCrudCreate<TData, TVariables>`
Creates a new record and invalidates relevant caches.
```ts
const createMutation = useCrudCreate<CategorySingleResponse, CreateCategoryInput>({
  fetcher: (data) => categoryApi.createCategory(data),
  invalidateQueryKeys: [categoryKeys.all],
});
```

### `useCrudUpdate<TData, TVariables>`
Updates an existing record and invalidates list & detail caches.
```ts
const updateMutation = useCrudUpdate<CategorySingleResponse, { id: string; data: UpdateCategoryInput }>({
  fetcher: ({ id, data }) => categoryApi.updateCategory(id, data),
  invalidateQueryKeys: (_data, variables) => [
    categoryKeys.all,
    categoryKeys.detail(variables.id),
  ],
});
```

### `useCrudDelete<TData, TId>`
Deletes a record and invalidates list caches.
```ts
const deleteMutation = useCrudDelete<DeleteCategoryResponse, string>({
  fetcher: (id) => categoryApi.deleteCategory(id),
  invalidateQueryKeys: [categoryKeys.all],
});
```

---

## Step-by-Step Guide: Creating a New CRUD Module

Follow these steps when creating a new module (e.g., `Product` or `UOM`):

### Step 1: Define API Client (`src/web/api/product.api.ts`)
Create the HTTP API client methods wrapping `apiClient`.

### Step 2: Define React Query Hooks (`src/web/hooks/product.hooks.ts`)
Use `createCrudQueryKeys` and the generic `useCrud*` hooks:
```ts
import { createCrudQueryKeys } from "../../core/crud";
import { useCrudList, useCrudItem, useCrudCreate, useCrudUpdate, useCrudDelete } from "../../hooks/crud";
import { productApi } from "../api/product.api";

export const productKeys = createCrudQueryKeys("products");

export function useProducts(params?: ProductQueryParams) {
  return useCrudList({
    queryKey: productKeys.list(params),
    fetcher: (p) => productApi.getProducts(p),
    params,
  });
}
```

### Step 3: Build the UI Page (`src/pages/ProductsPage.tsx`)
Use `CrudPage`, `CrudToolbar`, `CrudTable`, `CrudPagination`, and `CrudDeleteDialog`:
```tsx
import { CrudPage, CrudToolbar, CrudTable, CrudPagination, CrudDeleteDialog } from "../components/crud";
import { useProducts, useDeleteProduct } from "../web/hooks/product.hooks";

export function ProductsPage() {
  // 1. Manage state (page, search, selected item, modal visibility)
  // 2. Query data using useProducts()
  // 3. Render CrudPage shell wrapping CrudToolbar, CrudTable, and CrudPagination
}
```

---

## Reference Implementation: Category Module

The `Category` module serves as the canonical reference implementation in StudioOS:

- **API Client**: `src/web/api/category.api.ts`
- **Hooks**: `src/web/hooks/category.hooks.ts`
- **Components**: `src/web/components/categories/`
- **Page**: `src/pages/CategoriesPage.tsx`
- **Unit Tests**: `tests/categoryHooks.test.ts`, `tests/crudHooks.test.ts`, `tests/crudCore.test.ts`, `tests/crudComponents.test.ts`

---

## Quality Checklist for New Modules

When building a new module with the Shared CRUD Framework, ensure:

- [ ] Query keys use `createCrudQueryKeys` or conform to `[entity, "list" | "detail", ...]` tuple key conventions.
- [ ] List queries use `useCrudList` and detail queries use `useCrudItem`.
- [ ] Mutations use `useCrudCreate`, `useCrudUpdate`, or `useCrudDelete` with proper `invalidateQueryKeys`.
- [ ] No duplicated pagination, filter cleaning, or response formatting functions are defined inside the module.
- [ ] Page layout uses `CrudPage`, `CrudToolbar`, `CrudTable`, `CrudPagination`, and `CrudDeleteDialog`.
- [ ] `tsc --noEmit` and `npm run lint` report zero errors.
