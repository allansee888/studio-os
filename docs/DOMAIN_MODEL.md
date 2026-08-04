# StudioOS Domain Model Documentation

**Project:** StudioOS ERP Platform  
**Tagline:** Run your studio. Not your paperwork.  
**Task ID:** DOMAIN-001  

---

## 1. Executive Summary

The StudioOS domain model encapsulates core business concepts for photography studios, print shops, and retail businesses. The domain architecture follows **Domain-Driven Design (DDD)** principles:
- **Clean separation:** Domain models are decoupled from UI presentation and framework logic.
- **Root Entity:** Everything in the catalog stems from `CatalogItem`, representing both physical products and services cleanly.
- **Central Transactional Hub:** Everything in StudioOS revolves around `Order`. Orders aggregate items, payments, customers, and production jobs.

---

## 2. Core Bounded Contexts & Entities

### A. Catalog Context
- **CatalogItem**: Root entity representing physical products (e.g. photo frames, albums) or services (e.g. passport photos, portrait sessions, custom printing).
  - `itemType`: `PHYSICAL_PRODUCT` | `SERVICE`
  - Optional linkage to `InventoryItem` (for physical stock).
  - Optional linkage to `WorkflowTemplate` (for production processes).
  - Optional `barcode` for POS scanning.
- **Category**: Hierarchical organization for catalog items with parent-child support.

### B. Customer & Supplier Context
- **Customer**: Studio client records identified by human-friendly identifiers (`CUS-2026-000001`).
- **Supplier**: Vendors and manufacturers supplying inventory or raw materials.

### C. Order & Financial Context
- **Order**: Master transaction record tracking sales, customer assignment, totals, taxes, discounts, and order lifecycle (`DRAFT`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **OrderItem**: Line items capturing frozen pricing, catalog item references, quantities, and specific job requirements.
- **Payment**: Payment receipts against orders tracking payment methods (`CASH`, `CREDIT_CARD`, etc.) and payment statuses (`RCP-2026-000001`).

### D. Inventory Context
- **InventoryItem**: 1-to-1 extension of a physical `CatalogItem` storing quantity on hand, reorder thresholds, and bin/shelf location.
- **StockMovement**: Immutable log recording stock increments, decrements, and adjustments with reference numbers and audit details.

### E. Workflow & Production Context
- **WorkflowTemplate**: Configurable template defining standard operational workflows for studio services (e.g., Receive Files -> Printing -> Packaging -> Ready).
- **WorkflowStep**: Ordered step within a workflow template with estimated completion times.
- **ProductionJob**: Realized job instance tracking current step, status, assigned staff member, and start/completion timestamps (`JOB-2026-000001`).

### F. Identity & Audit Context
- **User**: System user / staff account assigned to production jobs, order creation, and payment recording.
- **AuditLog**: Traceability for administrative and financial events.

---

## 3. Human-Friendly Document Number Conventions

Per StudioOS architecture standards, document numbers follow structured, human-friendly patterns:
- **Orders:** `ORD-2026-000001`
- **Production Jobs:** `JOB-2026-000001`
- **Customers:** `CUS-2026-000001`
- **Payment Receipts:** `RCP-2026-000001`
- **Suppliers:** `SUP-2026-000001`

---

## 4. Architectural Rules & Design Principles

1. **UUID Primary Keys:** All database entities utilize standard UUID v4 primary keys internally (`id`). Database IDs are never exposed as primary document identifiers to end users.
2. **Optional Relationships:**
   - Inventory tracking is optional (`InventoryItem` only exists for items requiring stock management).
   - Workflows are optional (services/products can be sold without triggering production jobs).
   - Barcodes are optional.
3. **Strict Decoupling:** Business logic is maintained independently of UI components and controllers.
4. **Immutability of Audit Trails:** Stock movements and payments are recorded as immutable event records.
