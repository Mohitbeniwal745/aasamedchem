import { getProducts } from '@/lib/actions/products'
import { humanReadableStock, type AnyUnit } from '@/lib/units'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const LOW_STOCK_THRESHOLD = 500 // base units

export default async function AdminInventoryPage() {
  const products = await getProducts()

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Stock levels across all products. Items below {LOW_STOCK_THRESHOLD} base units are highlighted.
        </p>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No products in inventory</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Product</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Category</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Base Unit</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">
                      Raw Stock (base)
                    </th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">
                      Human-Readable
                    </th>
                    <th className="text-center py-3 px-2 font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stock = Number(product.stockInBaseUnit)
                    const isLow = stock < LOW_STOCK_THRESHOLD
                    return (
                      <tr
                        key={product.id}
                        className={cn(
                          'border-b border-slate-50 transition-colors',
                          isLow
                            ? 'bg-amber-50/60 hover:bg-amber-50'
                            : 'hover:bg-slate-50/50'
                        )}
                      >
                        <td className="py-3 px-2 text-slate-900 font-medium">
                          {product.name}
                        </td>
                        <td className="py-3 px-2 text-slate-600">{product.category}</td>
                        <td className="py-3 px-2 text-slate-600">{product.baseUnit}</td>
                        <td className="py-3 px-2 text-right text-slate-600 font-mono text-xs">
                          {stock.toFixed(2)} {product.baseUnit}
                        </td>
                        <td className="py-3 px-2 text-right text-slate-900 font-medium">
                          {humanReadableStock(stock, product.baseUnit as AnyUnit)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
