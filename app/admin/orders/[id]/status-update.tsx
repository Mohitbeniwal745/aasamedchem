'use client'

import { updateOrderStatus } from '@/lib/actions/orders'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const statuses = ['pending', 'confirmed', 'fulfilled', 'cancelled'] as const

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleUpdate() {
    if (status === currentStatus) return
    setLoading(true)
    const result = await updateOrderStatus(
      orderId,
      status as (typeof statuses)[number]
    )
    setLoading(false)

    if (result.success) {
      toast(`Order status updated to ${status}`, 'success')
    } else {
      toast(result.message || 'Failed to update', 'error')
    }
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Update Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="max-w-[200px]"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
          <Button
            onClick={handleUpdate}
            disabled={loading || status === currentStatus}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
