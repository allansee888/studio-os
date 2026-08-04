# StudioOS Module Standard: Units of Measure (CAT-002)

## Purpose
The Unit of Measure (UOM) module defines standardized physical and service packaging units (e.g., Piece, Pack, Box, Roll, Sheet, Set, Pair, Bottle) used across StudioOS. Units of measure are referenced by Catalog Items, Inventory, Purchasing, and Financial Reporting to ensure consistent unit conversion and inventory accounting.

## Actors & Roles
- **System Administrator / Manager**: Full CRUD permissions (`unit.view`, `unit.create`, `unit.update`, `unit.delete`).
- **Studio Staff & Inventory Clerks**: Read-only view (`unit.view`) for selecting units during item entry, stock takes, and purchasing.

## Business Rules
1. **Unique Code**: Unit code must be unique (e.g., `UOM-PCS`, `UOM-PACK`). If left empty during creation, a unique code is auto-generated based on abbreviation or name.
2. **Required Fields**: `Name` (1-100 chars) and `Abbreviation` (1-20 chars) are mandatory.
3. **Soft Delete**: Deletions are executed as soft deletes (`deletedAt` timestamp).
4. **Reference Protection**: A Unit of Measure cannot be soft deleted if it is referenced by active or historical `CatalogItem` entities (or inventory/purchasing records).

## Database Schema (Prisma Model `UnitOfMeasure`)
```prisma
model UnitOfMeasure {
  id           String        @id @default(uuid())
  code         String        @unique
  name         String
  abbreviation String
  description  String?
  isActive     Boolean       @default(true)
  displayOrder Int           @default(0)
  deletedAt    DateTime?
  createdBy    String?
  updatedBy    String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  catalogItems CatalogItem[]
}
```

## API Endpoints (`/api/v1/units` & `/api/v1/catalog/units`)
- `GET /api/v1/units` - Paginated UOM list (QueryParams: `page`, `limit`, `search`, `isActive`, `sortBy`, `sortOrder`).
- `GET /api/v1/units/:id` - Fetch details for a specific unit by ID.
- `POST /api/v1/units` - Create a new unit of measure (`unit.create`).
- `PUT /api/v1/units/:id` - Update unit of measure details (`unit.update`).
- `DELETE /api/v1/units/:id` - Soft delete unit of measure (`unit.delete`).

## UI & Screens
1. **Unit Management Screen (`/units`)**:
   - Reusable `DataTable` listing Code, Name, Abbreviation, Description, Display Order, Active Status, and Linked Catalog Items count.
   - Filters: Search input (Name/Code/Abbreviation/Description), Status selector, Sort field, Sort order toggle, and Refresh button.
   - Pagination controls: Page navigation and items per page selector.
2. **Create / Edit Unit Modal (`UomFormModal`)**:
   - Inputs for Name, Abbreviation, Code (optional auto-gen), Display Order, Description, and Active Status checkbox.
3. **Unit Details Modal (`UomDetailsModal`)**:
   - Inspects Unit metadata, system UUID, abbreviation badge, linked item count, and creation/update audit timestamps.
4. **Delete Confirmation Dialog**:
   - Guarded confirmation modal preventing deletion if linked catalog items exist.

## Validation
Handled via `zod` schema in `src/packages/validation/uom.ts`:
- `createUomSchema`
- `updateUomSchema`
- `uomQuerySchema`

## Acceptance Criteria Verification
- [x] CRUD operations fully functional
- [x] Search, filter, sorting, and pagination supported
- [x] Soft delete enabled with reference safeguards
- [x] Protected by RBAC permissions (`unit.view`, `unit.create`, `unit.update`, `unit.delete`)
- [x] Navigation item integrated under Catalog section
- [x] Responsive, accessible UI with dark/light mode support
- [x] Unit and integration tests passing (`tests/uom.test.ts`)
