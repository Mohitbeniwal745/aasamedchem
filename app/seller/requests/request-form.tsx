'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createProductRequest, type RequestFormState } from '@/lib/actions/requests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'

const initialState: RequestFormState = {}

export function RequestForm() {
  const [state, formAction, pending] = useActionState(createProductRequest, initialState)
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast('Custom request submitted successfully!', 'success')
      formRef.current?.reset()
    } else if (state?.message && !state?.success) {
      toast(state.message, 'error')
    }
  }, [state, toast])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Specialty Enzyme, Rare Reagent"
          required
        />
        {state?.errors?.name && (
          <p className="text-xs text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="any"
            min="0.00000001"
            placeholder="e.g. 100"
            required
          />
          {state?.errors?.quantity && (
            <p className="text-xs text-red-500">{state.errors.quantity[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Select id="unit" name="unit" required>
            <option value="">Select...</option>
            <option value="g">grams (g)</option>
            <option value="kg">kilograms (kg)</option>
            <option value="mL">millilitres (mL)</option>
            <option value="L">litres (L)</option>
            <option value="unit">units (count)</option>
          </Select>
          {state?.errors?.unit && (
            <p className="text-xs text-red-500">{state.errors.unit[0]}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Specifications</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Specify purity, packaging, urgency, etc. (optional)"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full cursor-pointer" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          'Submit Request'
        )}
      </Button>
    </form>
  )
}
