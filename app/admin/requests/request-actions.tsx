'use client'

import { useState } from 'react'
import { updateRequestStatus } from '@/lib/actions/requests'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

export function RequestActions({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
  const { toast } = useToast()

  async function handleUpdate(status: 'approved' | 'rejected') {
    setLoading(status)
    const result = await updateRequestStatus(requestId, status)
    setLoading(null)

    if (result.success) {
      toast(`Request ${status} successfully!`, 'success')
    } else {
      toast(result.message || 'Failed to update request', 'error')
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleUpdate('approved')}
        disabled={loading !== null}
        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer"
      >
        {loading === 'approved' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleUpdate('rejected')}
        disabled={loading !== null}
        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800 cursor-pointer"
      >
        {loading === 'rejected' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
        Reject
      </Button>
    </div>
  )
}
