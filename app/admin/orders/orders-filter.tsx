'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const statuses = ['all', 'pending', 'confirmed', 'fulfilled', 'cancelled']

export function OrdersFilter({ currentStatus }: { currentStatus: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status}
          variant={currentStatus === status ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilter(status)}
          className={cn(
            currentStatus === status ? '' : 'text-slate-600'
          )}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Button>
      ))}
    </div>
  )
}
