# StudioOS Module Standard: Product & Service Categories (CAT-001)

## Purpose
The Category module manages unified classification for both physical products (e.g., photo frames, electronics, batteries, office supplies) and services (e.g., photo printing, ID/passport photos, custom retouching). It provides a multi-level hierarchy (unlimited parent-child relationship), display ordering, active status toggling, and soft deletion.

## Actors & Roles
- **System Administrator / Manager**: Full CRUD permissions (`catalog.category.view`, `catalog.category.create`, `catalog.category.update`, `catalog.category.delete`).
- **Studio Staff**: View category hierarchy (`catalog.category.view`) for order creation and inventory browsing.

## Business Rules
1. **Unique Code**: Category code must be unique across the catalog (e.g., `CAT-PRINTING`, `CAT-IDPHOTOS`). If not provided during creation, it is auto-generated.
2. **Name Required**: Category name is mandatory (1-100 characters).
3. **Unlimited Hierarchy**: Categories support optional `parentCategoryId`. A category can be a root or nested under another category.
4. **Circular Parent Prevention**: A category cannot be set as its own parent, nor can its parent be set to any of its own descendants.
5. **Deletion Protection**: Soft delete (`deletedAt` timestamp). A category cannot be deleted if it contains active subcategories or assigned catalog items.

## Database Schema (Prisma Model `Category`)
```prisma
model Category {
  id               String      @id @default(uuid())
  code             String      @unique
  name             String
  description      String?
  parentCategoryId String?
  displayOrder     Int         @default(0)
  isActive         Boolean     @default(true)
  deletedAt        DateTime?
  createdBy        String?
  updatedBy        String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  parent           Category?   @relation("CategoryHierarchy", fields: [parentCategoryId], references: [id], onDelete: SetNull)
  children         Category[]  @relation("CategoryHierarchy")
  items            CatalogItem[]

  @@index([parentCategoryId])
  @@index([displayOrder])
  @@index([isActive])
}
```

## API Endpoints (`/api/v1/categories`)
- `GET /api/v1/categories` - Paginated category list (QueryParams: `page`, `limit`, `search`, `isActive`, `parentCategoryId`, `sortBy`, `sortOrder`).
- `GET /api/v1/categories/tree` - Hierarchical tree view representation of root categories with nested children.
- `GET /api/v1/categories/:id` - Fetch category details by ID with parent and subcategories.
- `POST /api/v1/categories` - Create new category (`catalog.category.create`).
- `PUT /api/v1/categories/:id` - Update category (`catalog.category.update`).
- `DELETE /api/v1/categories/:id` - Soft delete category (`catalog.category.delete`).

## UI & Screens
1. **Category Management Screen (`/categories`)**:
   - View Mode Switcher: **DataTable List** vs **Hierarchy Tree View**.
   - Filters: Search input, Active Status Filter, Parent Category Filter, Refresh button.
   - Pagination: Page controls and per-page limit selector.
2. **Category Form Modal**: Create/Edit modal with name, code, parent selector (circular-safe), description, display order, and active status toggle.
3. **Category Details Modal**: Inspect code, parent, direct subcategories, items count, and audit timestamps.
4. **Confirm Delete Modal**: Destructive soft delete confirmation with guard checks.

## Validation
Handled via `zod` schema in `src/packages/validation/category.ts`:
- `createCategorySchema`
- `updateCategorySchema`
- `categoryQuerySchema`

## Acceptance Criteria Verification
- [x] CRUD operations fully functional
- [x] Search, filter, and sorting supported
- [x] Unlimited hierarchy and tree rendering supported
- [x] Circular parent selection prevented
- [x] Soft delete enabled with reference safeguards
- [x] Guarded by RBAC permissions (`catalog.category.*`)
- [x] Fully responsive, accessible, dark/light mode supported
- [x] Unit and integration tests passing (`tests/category.test.ts`)
