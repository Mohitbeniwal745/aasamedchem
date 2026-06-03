import { getProductById } from '@/lib/actions/products'
import { notFound } from 'next/navigation'
import { EditProductForm } from './edit-form'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return <EditProductForm product={product} />
}
