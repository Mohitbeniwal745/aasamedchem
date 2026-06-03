import { getMyOrders } from '@/lib/actions/orders'
import { formatINR } from '@/lib/units'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { ExpandableOrder } from './expandable-order'

export const dynamic = 'force-dynamic'

export default async function SellerOrdersPage() {
  const orders = await getMyOrders()

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track all your orders and quotations
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <p className="text-slate-500">No orders yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-md overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-mono">
                      {order.id.slice(0, 8)}...
                    </CardTitle>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatINR(Number(order.totalInr))}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <ExpandableOrder items={order.items} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
