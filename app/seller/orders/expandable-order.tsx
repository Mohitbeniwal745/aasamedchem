'use client'

import { useState } from 'react'
import { formatINR } from '@/lib/units'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface OrderItemData {
  id: string
  orderedQtyBase: string
  orderedUnit: string
  orderedQtyDisplay: string
  unitPriceInr: string
  lineTotalInr: string
  productName: string | null
  productSku: string | null
  productBaseUnit: string | null
}

export function ExpandableOrder({ items }: { items: OrderItemData[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-slate-500 hover:text-slate-700 px-0"
      >
        {expanded ? (
          <>
            <ChevronUp className="w-3 h-3 mr-1" />
            Hide Items ({items.length})
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3 mr-1" />
            Show Items ({items.length})
          </>
        )}
      </Button>

      {expanded && (
        <div className="mt-3 overflow-x-auto animate-in">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-2 font-medium text-slate-500">
                  Product
                </th>
                <th className="text-left py-2 px-2 font-medium text-slate-500">
                  SKU
                </th>
                <th className="text-right py-2 px-2 font-medium text-slate-500">
                  Ordered (display)
                </th>
                <th className="text-right py-2 px-2 font-medium text-slate-500">
                  Ordered (base)
                </th>
                <th className="text-right py-2 px-2 font-medium text-slate-500">
                  Unit Price
                </th>
                <th className="text-right py-2 px-2 font-medium text-slate-500">
                  Line Total
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50"
                >
                  <td className="py-2 px-2 text-slate-900 font-medium">
                    {item.productName || '—'}
                  </td>
                  <td className="py-2 px-2 text-slate-500 font-mono">
                    {item.productSku || '—'}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900">
                    {Number(item.orderedQtyDisplay).toFixed(2)} {item.orderedUnit}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-500 font-mono">
                    {Number(item.orderedQtyBase).toFixed(2)} {item.productBaseUnit}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-600">
                    {formatINR(Number(item.unitPriceInr))}/{item.productBaseUnit}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 font-semibold">
                    {formatINR(Number(item.lineTotalInr))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
