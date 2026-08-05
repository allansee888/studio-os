# Unit of Measure (UOM) Module — Architecture & Implementation Review

## Overview
The Units of Measure (UOM) module has been refactored and standardized using the StudioOS **Shared CRUD Framework**. It adheres strictly to Clean Architecture, Domain-Driven Design (DDD), and SOLID principles, utilizing the centralized repository pattern, service layer, controllers, Zod validation schemas, and React Query hooks.

---

## 1. Database Model (`UnitOfMeasure`)
The `UnitOfMeasure` model is defined in `prisma/schema.prisma`:

```prisma
model UnitOfMeasure {
  id            String    @id @default(uuid())
  code          String    @unique
  name          String
  abbreviation  String
  description   String?
  decimalPlaces Int       @default(2)
  displayOrder  Int       @default(0)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  createdBy     String?
  updatedBy     String?
  deletedAt     DateTime?

  catalogItems CatalogItem[]

  @@index([code])
  @@index([name])
  @@index([isActive])
  @@map("unit_of_measures")
}
```

### Key Field & Index Characteristics
- `id`: UUID Primary Key.
- `code`: Unique, indexed string (e.g., `UOM-PCS`, `UOM-KG`).
- `name`: Human-readable name, indexed (e.g., `Piece`, `Kilogram`).
- `abbreviation`: Short code, e.g., `pc`, `kg`, `box`.
- `decimalPlaces`: Integer (0–6), defaulting to 2, controlling precision in inventory and invoicing calculations.
- `isActive`: Boolean, indexed for filtering active vs inactive units.
- `deletedAt`: Timestamp for soft-deletion.

---

## 2. Validation Layer (`packages/validation/uom.ts`)
Standardized Zod validation schemas ensure type safety and boundary checking for all incoming requests:

- **`createUomSchema`**:
  - `name`: Required, max 100 characters.
  - `abbreviation`: Required, max 20 characters.
  - `code`: Optional (auto-generated if omitted), max 50 characters.
  - `decimalPlaces`: Integer between 0 and 6 (default 2).
  - `displayOrder`: Integer ≥ 0.
  - `isActive`: Boolean (default true).

- **`updateUomSchema`**: Partial of `createUomSchema`.
- **`uomQuerySchema`**: Validates search, `page`, `limit`, `isActive`, `sortBy`, and `sortOrder`.

---

## 3. Backend Architecture

### Repository (`src/api/repositories/uom.repository.ts`)
Handles database queries using Prisma:
- `findAll(filters)`: Supports pagination, soft-delete filtering (`deletedAt: null`), search across `name`, `code`, `abbreviation`, and `description`, status filtering, sorting, and calculates `itemsCount` from related `catalogItems`.
- `findById(id)`: Fetches a single UOM by ID with `itemsCount`.
- `findByCode(code)`, `findByName(name)`, `findByAbbreviation(abbreviation)`: Case-insensitive lookups for uniqueness validation.
- `create(data)`, `update(id, data)`: Persists changes.
- `delete(id, userId)`: Soft-deletes by setting `deletedAt = now()`.

### Service (`src/api/services/uom.service.ts`)
Enforces core business rules:
1. **Unique Code**: Verified case-insensitively across existing active records. Auto-generates unique `UOM-XXX` code if left empty.
2. **Unique Name**: Prevents duplicate unit names.
3. **Abbreviation Required**: Prevents duplicate abbreviations.
4. **Decimal Precision**: Enforces `0 <= decimalPlaces <= 6`.
5. **Referential Integrity**: Prevents deletion of units referenced by active `catalogItems`.

### Controller (`src/api/controllers/uom.controller.ts`) & Routes (`src/api/v1/routes/units.ts`)
- Configures REST endpoints under `/api/v1/units`.
- Applies authentication (`authenticate`) and RBAC (`requireAnyPermission`) middleware (`unit.view`, `unit.create`, `unit.update`, `unit.delete`).
- Uses Zod validation middleware (`validateQuery`, `validateBody`).

---

## 4. Frontend & Shared CRUD Integration

### API Client (`src/web/api/uom.api.ts`)
Exported functions wrapping `apiFetch`:
- `getUnits(params)`
- `getUnit(id)`
- `createUnit(data)`
- `updateUnit(id, data)`
- `deleteUnit(id)`

### React Query Hooks (`src/web/hooks/uom.hooks.ts`)
Leverages the Shared CRUD Framework hooks and query key factory:
- `uomKeys`: Created using `createCrudQueryKeys("units")`.
- `useUnits(params)`: Uses `useCrudList`.
- `useUnit(id)`: Uses `useCrudItem`.
- `useCreateUnit()`: Uses `useCrudCreate`, invalidating `uomKeys.all`.
- `useUpdateUnit()`: Uses `useCrudUpdate`, invalidating `uomKeys.all` and `uomKeys.detail(id)`.
- `useDeleteUnit()`: Uses `useCrudDelete`, invalidating `uomKeys.all`.

### UI Layer (`src/web/pages/Units.tsx`)
Constructed using standard framework UI components:
- `CrudPage`: Page container with breadcrumbs, header, primary action, access control, and feedback banners.
- `CrudToolbar`: Search, status dropdown filter, and refresh button.
- `CrudTable`: Generic table component rendering custom columns for Code, Name, Abbreviation, Decimals, Order, Status (`CrudStatusBadge`), Catalog Items Count, Created Date, and Action icons.
- `CrudPagination`: Standardized pagination controls with page size selector.
- `CrudDeleteDialog`: Accessible modal for confirmation of deletion.
- `UomFormModal`: Modal for creating and editing UOM with `decimalPlaces` support.
- `UomDetailsModal`: Detailed view modal.

---

## 5. Verification
- `npm run lint` / `lint_applet`: Passed with 0 errors.
- `compile_applet`: Build succeeded cleanly.
