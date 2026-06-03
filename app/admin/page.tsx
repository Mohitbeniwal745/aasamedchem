import { getProductStats } from '@/lib/actions/products'
import { getOrderStats, getRecentOrders } from '@/lib/actions/orders'
import { formatINR } from '@/lib/units'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { Package, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [productStats, orderStats, recentOrders] = await Promise.all([
    getProductStats(),
    getOrderStats(),
    getRecentOrders(10),
  ])
  const { totalProducts, lowStockProducts } = productStats
  const { pendingOrders, confirmedTotal } = orderStats

  const metrics = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Confirmed Revenue',
      value: formatINR(confirmedTotal),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Low-Stock Items',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="space-y-6 animate-in">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.title} className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${m.bg}`}>
                  <m.icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{m.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link
              href="/admin/orders"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Seller</th>
                    <th className="text-left py-3 px-2 font-medium text-slate-500">Status</th>
                    <th className="text-right py-3 px-2 font-medium text-slate-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-3 px-2 text-slate-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-2 text-slate-900 font-medium">
                        {order.userName || '—'}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-2 text-right text-slate-900 font-medium">
                        {formatINR(Number(order.totalInr))}
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
