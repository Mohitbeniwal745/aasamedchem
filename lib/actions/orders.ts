'use server'

import { db } from '@/lib/db'
import { orders, orderItems, products, users } from '@/drizzle/schema'
import { eq, desc, sql, and } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'
import { toBaseUnit, calculateLineTotal, validateUnitCompatible, type AnyUnit } from '@/lib/units'

export type CartItem = {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: AnyUnit
  baseUnit: string
  basePricePerBaseUnit: number
}

export async function placeOrder(items: CartItem[], notes?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'Not authenticated' }
  }

  if (items.length === 0) {
    return { success: false, message: 'Cart is empty' }
  }

  try {
    // Validate all items and compute totals
    const orderItemsData = []
    let grandTotal = 0

    for (const item of items) {
      // Fetch current product to get latest price
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1)

      if (!product) {
        return {
          success: false,
          message: `Product ${item.productName} not found`,
        }
      }

      // Validate unit compatibility
      if (!validateUnitCompatible(product.baseUnit, item.unit)) {
        return {
          success: false,
          message: `Unit ${item.unit} is not compatible with product ${product.name} (base unit: ${product.baseUnit})`,
        }
      }

      // Convert to base unit
      const qtyBase = toBaseUnit(item.quantity, item.unit)
      const basePrice = Number(product.basePricePerBaseUnit)
      const lineTotal = calculateLineTotal(qtyBase, basePrice)

      // Check stock
      if (qtyBase > Number(product.stockInBaseUnit)) {
        return {
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${Number(product.stockInBaseUnit).toFixed(2)} ${product.baseUnit}`,
        }
      }

      orderItemsData.push({
        productId: product.id,
        orderedQtyBase: qtyBase.toFixed(8),
        orderedUnit: item.unit,
        orderedQtyDisplay: item.quantity.toFixed(8),
        unitPriceInr: basePrice.toFixed(8),
        lineTotalInr: lineTotal.toFixed(8),
      })

      grandTotal += lineTotal
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        totalInr: grandTotal.toFixed(8),
        notes: notes || null,
        status: 'pending',
      })
      .returning()

    // Create order items
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        orderId: order.id,
        ...item,
      })
    }

    // Deduct stock
    for (const item of items) {
      const qtyBase = toBaseUnit(item.quantity, item.unit)
      await db
        .update(products)
        .set({
          stockInBaseUnit: sql`${products.stockInBaseUnit} - ${qtyBase.toFixed(8)}`,
          updatedAt: new Date(),
        })
        .where(eq(products.id, item.productId))
    }

    revalidatePath('/admin/orders')
    revalidatePath('/admin/inventory')
    revalidatePath('/admin')
    revalidatePath('/seller')
    revalidatePath('/seller/orders')
    revalidateTag('orders', 'max')
    revalidateTag('products', 'max')

    return { success: true, orderId: order.id, message: 'Order placed successfully' }
  } catch (error) {
    console.error('Place order error:', error)
    return { success: false, message: 'Failed to place order' }
  }
}

export async function getOrders(statusFilter?: string) {
  const status = statusFilter || 'all'
  return unstable_cache(
    async () => {
      const conditions = []

      if (statusFilter && statusFilter !== 'all') {
        conditions.push(eq(orders.status, statusFilter as 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'))
      }

      const result = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          totalInr: orders.totalInr,
          notes: orders.notes,
          createdAt: orders.createdAt,
          userName: users.name,
          userEmail: users.email,
          itemCount: sql<number>`count(${orderItems.id})::int`,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(
          orders.id,
          orders.userId,
          orders.status,
          orders.totalInr,
          orders.notes,
          orders.createdAt,
          users.name,
          users.email
        )
        .orderBy(desc(orders.createdAt))

      return result
    },
    ['orders-list', status],
    { tags: ['orders'] }
  )()
}

export async function getMyOrders() {
  const session = await auth()
  if (!session?.user?.id) return []
  const userId = session.user.id

  return unstable_cache(
    async () => {
      const rows = await db
        .select({
          orderId: orders.id,
          userId: orders.userId,
          status: orders.status,
          totalInr: orders.totalInr,
          notes: orders.notes,
          createdAt: orders.createdAt,
          itemId: orderItems.id,
          orderedQtyBase: orderItems.orderedQtyBase,
          orderedUnit: orderItems.orderedUnit,
          orderedQtyDisplay: orderItems.orderedQtyDisplay,
          unitPriceInr: orderItems.unitPriceInr,
          lineTotalInr: orderItems.lineTotalInr,
          productName: products.name,
          productSku: products.sku,
          productBaseUnit: products.baseUnit,
        })
        .from(orders)
        .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))

      const ordersMap = new Map<string, any>()
      for (const row of rows) {
        if (!ordersMap.has(row.orderId)) {
          ordersMap.set(row.orderId, {
            id: row.orderId,
            userId: row.userId,
            status: row.status,
            totalInr: row.totalInr,
            notes: row.notes,
            createdAt: row.createdAt,
            items: [],
          })
        }
        if (row.itemId) {
          ordersMap.get(row.orderId).items.push({
            id: row.itemId,
            orderedQtyBase: row.orderedQtyBase,
            orderedUnit: row.orderedUnit,
            orderedQtyDisplay: row.orderedQtyDisplay,
            unitPriceInr: row.unitPriceInr,
            lineTotalInr: row.lineTotalInr,
            productName: row.productName,
            productSku: row.productSku,
            productBaseUnit: row.productBaseUnit,
          })
        }
      }

      return Array.from(ordersMap.values())
    },
    ['my-orders', userId],
    { tags: ['orders'] }
  )()
}

export async function getOrderById(id: string) {
  return unstable_cache(
    async () => {
      const [orderRows, items] = await Promise.all([
        db
          .select({
            id: orders.id,
            userId: orders.userId,
            status: orders.status,
            totalInr: orders.totalInr,
            notes: orders.notes,
            createdAt: orders.createdAt,
            userName: users.name,
            userEmail: users.email,
          })
          .from(orders)
          .leftJoin(users, eq(orders.userId, users.id))
          .where(eq(orders.id, id))
          .limit(1),
        db
          .select({
            id: orderItems.id,
            orderedQtyBase: orderItems.orderedQtyBase,
            orderedUnit: orderItems.orderedUnit,
            orderedQtyDisplay: orderItems.orderedQtyDisplay,
            unitPriceInr: orderItems.unitPriceInr,
            lineTotalInr: orderItems.lineTotalInr,
            productName: products.name,
            productSku: products.sku,
            productBaseUnit: products.baseUnit,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, id))
      ])

      const order = orderRows[0]
      if (!order) return null

      return { ...order, items }
    },
    ['order-detail', id],
    { tags: ['orders'] }
  )()
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
) {
  try {
    await db
      .update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId))

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/admin')
    revalidatePath('/seller/orders')
    revalidateTag('orders', 'max')

    return { success: true }
  } catch {
    return { success: false, message: 'Failed to update order status' }
  }
}

export async function getOrderStats() {
  return unstable_cache(
    async () => {
      const [stats] = await db
        .select({
          pendingOrders: sql<number>`count(case when ${orders.status} = 'pending' then 1 end)::int`,
          confirmedTotal: sql<string>`coalesce(sum(case when ${orders.status} in ('confirmed', 'fulfilled') then ${orders.totalInr} else 0 end), 0)`,
        })
        .from(orders)

      return {
        pendingOrders: stats?.pendingOrders || 0,
        confirmedTotal: Number(stats?.confirmedTotal || 0),
      }
    },
    ['order-stats'],
    { tags: ['orders'] }
  )()
}

export async function getRecentOrders(limit = 10) {
  return unstable_cache(
    async () => {
      const result = await db
        .select({
          id: orders.id,
          status: orders.status,
          totalInr: orders.totalInr,
          createdAt: orders.createdAt,
          userName: users.name,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.createdAt))
        .limit(limit)

      return result
    },
    ['recent-orders', String(limit)],
    { tags: ['orders'] }
  )()
}
