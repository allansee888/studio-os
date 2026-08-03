// StudioOS Domain Entities and Types
// Pure Domain Interfaces representing business domain concepts

export enum CatalogItemType {
  PHYSICAL_PRODUCT = "PHYSICAL_PRODUCT",
  SERVICE = "SERVICE",
}

export enum OrderStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum StockMovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum ProductionJobStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface CatalogCategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  parent?: CatalogCategory | null;
  children?: CatalogCategory[];
  items?: CatalogItem[];
}

export interface Supplier {
  id: string;
  supplierNumber: string; // e.g. SUP-2026-000001
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  catalogItems?: CatalogItem[];
  inventoryItems?: InventoryItem[];
}

export interface Customer {
  id: string;
  customerNumber: string; // e.g. CUS-2026-000001
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  orders?: Order[];
}

export interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  itemType: CatalogItemType;
  price: number;
  costPrice?: number | null;
  barcode?: string | null;
  isActive: boolean;
  categoryId?: string | null;
  workflowTemplateId?: string | null;
  supplierId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  category?: CatalogCategory | null;
  workflowTemplate?: WorkflowTemplate | null;
  supplier?: Supplier | null;
  inventoryItem?: InventoryItem | null;
  orderItems?: OrderItem[];
}

export interface InventoryItem {
  id: string;
  catalogItemId: string;
  sku: string;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  location?: string | null;
  supplierId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  catalogItem?: CatalogItem;
  supplier?: Supplier | null;
  stockMovements?: StockMovement[];
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string | null;
  referenceNumber?: string | null;
  createdById?: string | null;
  createdAt: Date;

  inventoryItem?: InventoryItem;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  catalogItems?: CatalogItem[];
  workflowSteps?: WorkflowStep[];
  productionJobs?: ProductionJob[];
}

export interface WorkflowStep {
  id: string;
  workflowTemplateId: string;
  stepOrder: number;
  name: string;
  description?: string | null;
  estimatedMinutes?: number | null;
  createdAt: Date;
  updatedAt: Date;

  workflowTemplate?: WorkflowTemplate;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-2026-000001
  customerId?: string | null;
  status: OrderStatus;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  paidAmount: number;
  notes?: string | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;

  customer?: Customer | null;
  orderItems?: OrderItem[];
  payments?: Payment[];
  productionJobs?: ProductionJob[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  catalogItemId?: string | null;
  itemType: CatalogItemType;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  order?: Order;
  catalogItem?: CatalogItem | null;
  productionJob?: ProductionJob | null;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. RCP-2026-000001
  orderId: string;
  amount: number;
  paymentMethod: string;
  reference?: string | null;
  status: PaymentStatus;
  notes?: string | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;

  order?: Order;
}

export interface ProductionJob {
  id: string;
  jobNumber: string; // e.g. JOB-2026-000001
  orderId?: string | null;
  orderItemId?: string | null;
  workflowTemplateId?: string | null;
  currentStep?: string | null;
  status: ProductionJobStatus;
  assignedToId?: string | null;
  notes?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  order?: Order | null;
  orderItem?: OrderItem | null;
  workflowTemplate?: WorkflowTemplate | null;
}
