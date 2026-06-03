'use client'

import { deleteProduct } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteProduct(productId)
    setLoading(false)
    setConfirming(false)

    if (result.success) {
      toast(`${productName} deleted`, 'success')
    } else {
      toast(result.message || 'Failed to delete', 'error')
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      <Trash2 className="w-4 h-4 text-red-500" />
    </Button>
  )
}
