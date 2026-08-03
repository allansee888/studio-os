import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('Cashier'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  barcode: text('barcode'),
  name: text('name').notNull(),
  category: text('category').notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(0),
  minStockLevel: integer('min_stock_level').notNull().default(0),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  status: text('status').notNull().default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  receiptNumber: text('receipt_number').notNull().unique(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  paymentMethod: text('payment_method').notNull(), // Cash, Card, QR, etc.
  customerId: integer('customer_id').references(() => customers.id),
  cashierId: integer('cashier_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
  id: serial('id').primaryKey(),
  transactionId: integer('transaction_id').references(() => transactions.id).notNull(),
  itemType: text('item_type').notNull(), // 'product' or 'service'
  productId: integer('product_id').references(() => products.id),
  serviceId: integer('service_id').references(() => services.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  date: timestamp('date').defaultNow(),
  recordedById: integer('recorded_by_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
