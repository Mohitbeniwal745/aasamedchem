'use server'

import { db } from '@/lib/db'
import { productRequests, users } from '@/drizzle/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const requestSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  quantity: z.string().refine(
    (v) => !isNaN(Number(v)) && Number(v) > 0,
    'Quantity must be greater than 0'
  ),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
})

export type RequestFormState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createProductRequest(
  _prevState: RequestFormState,
  formData: FormData
): Promise<RequestFormState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { message: 'Not authenticated' }
  }

  const raw = {
    name: formData.get('name') as string,
    quantity: formData.get('quantity') as string,
    unit: formData.get('unit') as string,
    notes: formData.get('notes') as string,
  }

  const validated = requestSchema.safeParse(raw)
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      message: 'Validation failed',
    }
  }

  try {
    await db.insert(productRequests).values({
      userId: session.user.id,
      name: validated.data.name,
      quantity: validated.data.quantity,
      unit: validated.data.unit,
      notes: validated.data.notes || null,
      status: 'pending',
    })

    revalidatePath('/seller/requests')
    revalidatePath('/admin/requests')
    revalidateTag('requests', 'max')

    return { success: true, message: 'Request submitted successfully' }
  } catch (error) {
    console.error('Create request error:', error)
    return { message: 'Failed to submit request' }
  }
}

export async function getMyProductRequests() {
  const session = await auth()
  if (!session?.user?.id) return []
  const userId = session.user.id

  return unstable_cache(
    async () => {
      return db
        .select()
        .from(productRequests)
        .where(eq(productRequests.userId, userId))
        .orderBy(desc(productRequests.createdAt))
    },
    ['my-product-requests', userId],
    { tags: ['requests'] }
  )()
}

export async function getAllProductRequests() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') return []

  return unstable_cache(
    async () => {
      return db
        .select({
          id: productRequests.id,
          name: productRequests.name,
          quantity: productRequests.quantity,
          unit: productRequests.unit,
          notes: productRequests.notes,
          status: productRequests.status,
          createdAt: productRequests.createdAt,
          userName: users.name,
          userEmail: users.email,
        })
        .from(productRequests)
        .leftJoin(users, eq(productRequests.userId, users.id))
        .orderBy(desc(productRequests.createdAt))
    },
    ['all-product-requests'],
    { tags: ['requests'] }
  )()
}

export async function updateRequestStatus(
  requestId: string,
  newStatus: 'pending' | 'approved' | 'rejected'
) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'admin') {
    return { success: false, message: 'Unauthorized' }
  }

  try {
    await db
      .update(productRequests)
      .set({ status: newStatus })
      .where(eq(productRequests.id, requestId))

    revalidatePath('/seller/requests')
    revalidatePath('/admin/requests')
    revalidateTag('requests', 'max')

    return { success: true }
  } catch {
    return { success: false, message: 'Failed to update request status' }
  }
}
