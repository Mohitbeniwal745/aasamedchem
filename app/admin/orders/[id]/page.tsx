import { getOrderById } from '@/lib/actions/orders'
import { formatINR } from '@/lib/units'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { OrderStatusUpdate } from './status-update'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Order Detail</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{order.id}</p>
        </div>
      </div>

      {/* Order info */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Seller
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {order.userName || '—'}
              </p>
              <p className="text-xs text-slate-500">{order.userEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Date
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </p>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Grand Total
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatINR(Number(order.totalInr))}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-slate-700">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update */}
      <OrderStatusUpdate orderId={order.id} currentStatus={order.status} />

      {/* Line Items — Conversion Audit Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Line Items — Unit Conversion Audit
          </CardTitle>
          <p className="text-xs text-slate-500">
            This table shows the user&apos;s original order alongside the base-unit
            conversion used for pricing. Verify that conversions are correct.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="text-left py-3 px-3 font-medium text-slate-600">
                    Product
                  </th>
                  <th className="text-left py-3 px-3 font-medium text-slate-600">
                    SKU
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-slate-600">
                    Ordered (display)
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-slate-600">
                    Ordered (base)
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-slate-600">
                    Unit Price (INR/base)
                  </th>
                  <th className="text-right py-3 px-3 font-medium text-slate-600">
                    Line Total (INR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-slate-900 font-medium">
                      {item.productName || '—'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                      {item.productSku || '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900">
                      {Number(item.orderedQtyDisplay).toFixed(2)}{' '}
                      <span className="text-slate-500">{item.orderedUnit}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 font-mono text-xs">
                      {Number(item.orderedQtyBase).toFixed(2)}{' '}
                      <span className="text-slate-400">{item.productBaseUnit}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatINR(Number(item.unitPriceInr))}/{item.productBaseUnit}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-900 font-semibold">
                      {formatINR(Number(item.lineTotalInr))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200">
                  <td
                    colSpan={5}
                    className="py-3 px-3 text-right font-semibold text-slate-700"
                  >
                    Grand Total
                  </td>
                  <td className="py-3 px-3 text-right text-lg font-bold text-slate-900">
                    {formatINR(Number(order.totalInr))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
