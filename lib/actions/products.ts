'use server'

import { db } from '@/lib/db'
import { products } from '@/drizzle/schema'
import { eq, ilike, and, or, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  baseUnit: z.enum(['g', 'mL', 'unit'], {
    message: 'Base unit is required',
  }),
  basePricePerBaseUnit: z.string().refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    'Price must be greater than 0'
  ),
  stockInBaseUnit: z.string().refine(
    (v) => !isNaN(Number(v)) && Number(v) >= 0,
    'Stock must be 0 or greater'
  ),
})

export type ProductFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name') as string,
    sku: formData.get('sku') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    baseUnit: formData.get('baseUnit') as string,
    basePricePerBaseUnit: formData.get('basePricePerBaseUnit') as string,
    stockInBaseUnit: formData.get('stockInBaseUnit') as string,
  }

  const validated = productSchema.safeParse(raw)
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Validation failed',
    }
  }

  try {
    await db.insert(products).values({
      name: validated.data.name,
      sku: validated.data.sku,
      description: validated.data.description || null,
      category: validated.data.category,
      baseUnit: validated.data.baseUnit as 'g' | 'mL' | 'unit',
      basePricePerBaseUnit: validated.data.basePricePerBaseUnit,
      stockInBaseUnit: validated.data.stockInBaseUnit,
    })

    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
    revalidatePath('/admin')
    revalidatePath('/seller')
    revalidateTag('products', 'max')

    return { success: true, message: 'Product created successfully' }
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message.includes('unique')
        ? 'A product with this SKU already exists'
        : 'Failed to create product'
    return { message }
  }
}

export async function updateProduct(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name') as string,
    sku: formData.get('sku') as string,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    baseUnit: formData.get('baseUnit') as string,
    basePricePerBaseUnit: formData.get('basePricePerBaseUnit') as string,
    stockInBaseUnit: formData.get('stockInBaseUnit') as string,
  }

  const validated = productSchema.safeParse(raw)
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Validation failed',
    }
  }

  try {
    await db
      .update(products)
      .set({
        name: validated.data.name,
        sku: validated.data.sku,
        description: validated.data.description || null,
        category: validated.data.category,
        baseUnit: validated.data.baseUnit as 'g' | 'mL' | 'unit',
        basePricePerBaseUnit: validated.data.basePricePerBaseUnit,
        stockInBaseUnit: validated.data.stockInBaseUnit,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))

    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
    revalidatePath('/admin')
    revalidatePath('/seller')
    revalidateTag('products', 'max')

    return { success: true, message: 'Product updated successfully' }
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message.includes('unique')
        ? 'A product with this SKU already exists'
        : 'Failed to update product'
    return { message }
  }
}

export async function deleteProduct(id: string) {
  try {
    await db.delete(products).where(eq(products.id, id))
    revalidatePath('/admin/products')
    revalidatePath('/admin/inventory')
    revalidatePath('/admin')
    revalidatePath('/seller')
    revalidateTag('products', 'max')
    return { success: true }
  } catch {
    return { success: false, message: 'Failed to delete product' }
  }
}

export async function getProducts(search?: string, category?: string) {
  return unstable_cache(
    async () => {
      const conditions = []

      if (search && search.trim()) {
        conditions.push(
          or(
            ilike(products.name, `%${search}%`),
            ilike(products.sku, `%${search}%`)
          )
        )
      }

      if (category && category !== 'all') {
        conditions.push(eq(products.category, category))
      }

      const result = await db
        .select()
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(products.name)

      return result
    },
    ['products-list', search || '', category || ''],
    { tags: ['products'] }
  )()
}

export async function getProductById(id: string) {
  return unstable_cache(
    async () => {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1)

      return product || null
    },
    ['product-detail', id],
    { tags: ['products'] }
  )()
}

export async function getCategories() {
  return unstable_cache(
    async () => {
      const result = await db
        .selectDistinct({ category: products.category })
        .from(products)
        .where(sql`${products.category} IS NOT NULL`)
        .orderBy(products.category)

      return result.map((r) => r.category).filter(Boolean) as string[]
    },
    ['categories'],
    { tags: ['products'] }
  )()
}

export async function getProductStats() {
  return unstable_cache(
    async () => {
      const [stats] = await db
        .select({
          totalProducts: sql<number>`count(*)::int`,
          lowStockProducts: sql<number>`count(case when ${products.stockInBaseUnit} < 500 then 1 end)::int`,
        })
        .from(products)

      return {
        totalProducts: stats?.totalProducts || 0,
        lowStockProducts: stats?.lowStockProducts || 0,
      }
    },
    ['product-stats'],
    { tags: ['products'] }
  )()
}
