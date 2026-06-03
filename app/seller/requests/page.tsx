import { getMyProductRequests } from '@/lib/actions/requests'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RequestForm } from './request-form'

export const dynamic = 'force-dynamic'

export default async function SellerRequestsPage() {
  const requests = await getMyProductRequests()

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Custom Requests</h1>
        <p className="text-sm text-slate-500 mt-1">
          Request products that are not currently in the catalog. Admins will review and approve or reject them.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Request Form */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Request New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <RequestForm />
          </CardContent>
        </Card>

        {/* Requests History List */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">My Request History ({requests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No custom requests submitted yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-2 font-medium text-slate-500">Date</th>
                        <th className="text-left py-3 px-2 font-medium text-slate-500">Product Name</th>
                        <th className="text-right py-3 px-2 font-medium text-slate-500">Qty</th>
                        <th className="text-left py-3 px-3 font-medium text-slate-500">Notes</th>
                        <th className="text-center py-3 px-2 font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-2 text-slate-600 whitespace-nowrap">
                            {req.createdAt
                              ? new Date(req.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="py-3 px-2 text-slate-900 font-semibold">{req.name}</td>
                          <td className="py-3 px-2 text-right text-slate-900 font-medium">
                            {Number(req.quantity).toFixed(2)} <span className="text-slate-500 text-xs">{req.unit}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate" title={req.notes || ''}>
                            {req.notes || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {req.status === 'pending' && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 animate-pulse">
                                Pending
                              </span>
                            )}
                            {req.status === 'approved' && (
                              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                Approved
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                                Rejected
                              </span>
                            )}
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
      </div>
    </div>
  )
}
