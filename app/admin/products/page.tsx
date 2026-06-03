import { getProducts } from '@/lib/actions/products'
import { formatINR, humanReadableStock, type AnyUnit } from '@/lib/units'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteProductButton } from './delete-button'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your product catalogue ({products.length} products)
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No products yet. Click &quot;Add Product&quot; to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Name</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">SKU</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Category</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Base Unit</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Price / Unit</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Stock</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 text-slate-900 font-medium">{product.name}</td>
                      <td className="py-3 px-2 text-slate-600 font-mono text-xs">
                        {product.sku}
                      </td>
                      <td className="py-3 px-2 text-slate-600">{product.category}</td>
                      <td className="py-3 px-2 text-slate-600">{product.baseUnit}</td>
                      <td className="py-3 px-2 text-right text-slate-900">
                        {formatINR(Number(product.basePricePerBaseUnit))}/{product.baseUnit}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-900">
                        {humanReadableStock(
                          Number(product.stockInBaseUnit),
                          product.baseUnit as AnyUnit
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
