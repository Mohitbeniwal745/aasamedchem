import { getProducts, getCategories } from '@/lib/actions/products'
import { CatalogueClient } from './catalogue-client'

export const dynamic = 'force-dynamic'

export default async function SellerCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const { search, category } = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(search, category),
    getCategories(),
  ])

  return (
    <CatalogueClient
      initialProducts={products}
      categories={categories}
      initialSearch={search || ''}
      initialCategory={category || 'all'}
    />
  )
}
