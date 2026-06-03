import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'

// ─── Users ───────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hash
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'seller'] }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// ─── Products ────────────────────────────────────────────────────────
// base_unit is the canonical storage unit: 'g' (weight), 'mL' (volume), 'unit' (count)
// base_price_per_base_unit: INR per 1 base unit (e.g. ₹0.25 per mL)
// stock_in_base_unit: always stored in base unit (e.g. 5000 = 5000 mL = 5 L)
//
// NUMERIC(20,8) rationale:
//   - Precision 20 = up to 12 integer digits → handles crore-level INR totals
//   - Scale 8 = 8 decimal places → handles sub-paisa rates for bulk chemicals
//   - Never use FLOAT/REAL for money — binary floating-point causes rounding errors
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    sku: text('sku').unique(),
    description: text('description'),
    category: text('category'),
    baseUnit: text('base_unit', { enum: ['g', 'mL', 'unit'] }).notNull(),
    basePricePerBaseUnit: numeric('base_price_per_base_unit', {
      precision: 20,
      scale: 8,
    }).notNull(),
    stockInBaseUnit: numeric('stock_in_base_unit', {
      precision: 20,
      scale: 8,
    })
      .notNull()
      .default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index('products_name_idx').on(table.name),
    index('products_category_idx').on(table.category),
  ]
)

// ─── Orders ──────────────────────────────────────────────────────────
export const orders = pgTable(
  'orders',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    status: text('status', {
      enum: ['pending', 'confirmed', 'fulfilled', 'cancelled'],
    })
      .notNull()
      .default('pending'),
    totalInr: numeric('total_inr', { precision: 20, scale: 8 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [index('orders_user_id_idx').on(table.userId)]
)

// ─── Order Items ─────────────────────────────────────────────────────
// Stores BOTH the base-unit quantity (source of truth) AND the display-unit
// quantity (what the user originally entered), so the admin detail view can
// show the original input alongside the converted value.
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id),
    orderedQtyBase: numeric('ordered_qty_base', {
      precision: 20,
      scale: 8,
    }).notNull(), // always in base unit — source of truth
    orderedUnit: text('ordered_unit').notNull(), // unit the user chose (for display)
    orderedQtyDisplay: numeric('ordered_qty_display', {
      precision: 20,
      scale: 8,
    }).notNull(), // qty in user's chosen unit
    unitPriceInr: numeric('unit_price_inr', {
      precision: 20,
      scale: 8,
    }).notNull(), // snapshot of base_price at order time
    lineTotalInr: numeric('line_total_inr', {
      precision: 20,
      scale: 8,
    }).notNull(), // ordered_qty_base × unit_price_inr
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)]
)

// ─── Product Requests ────────────────────────────────────────────────
export const productRequests = pgTable(
  'product_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    quantity: numeric('quantity', { precision: 20, scale: 8 }).notNull(),
    unit: text('unit').notNull(),
    notes: text('notes'),
    status: text('status', {
      enum: ['pending', 'approved', 'rejected'],
    })
      .notNull()
      .default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [index('product_requests_user_id_idx').on(table.userId)]
)

// ─── Type Exports ────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type ProductRequest = typeof productRequests.$inferSelect
export type NewProductRequest = typeof productRequests.$inferInsert
