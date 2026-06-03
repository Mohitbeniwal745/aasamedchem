import { getOrders } from '@/lib/actions/orders'
import { formatINR } from '@/lib/units'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import Link from 'next/link'
import { OrdersFilter } from './orders-filter'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const statusFilter = status || 'all'
  const orders = await getOrders(statusFilter)

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage all orders ({orders.length} total)
        </p>
      </div>

      <OrdersFilter currentStatus={statusFilter} />

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {statusFilter === 'all' ? 'All Orders' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Orders`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Order ID</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Seller</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                    <th className="text-center py-3 px-2 font-medium text-slate-500">Items</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Total</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-mono text-xs font-medium hover:underline"
                        >
                          {order.id.slice(0, 8)}...
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-slate-900 font-medium">
                        {order.userName || '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2 text-center text-slate-600">
                        {order.itemCount}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-900 font-medium">
                        {formatINR(Number(order.totalInr))}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 transition-colors border border-indigo-100/50"
                        >
                          Manage Order
                        </Link>
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
