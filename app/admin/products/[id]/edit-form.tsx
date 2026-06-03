'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { updateProduct, type ProductFormState } from '@/lib/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Product } from '@/drizzle/schema'

const initialState: ProductFormState = {}

export function EditProductForm({ product }: { product: Product }) {
  const updateWithId = updateProduct.bind(null, product.id)
  const [state, formAction, pending] = useActionState(updateWithId, initialState)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (state?.success) {
      toast('Product updated successfully!', 'success')
      router.push('/admin/products')
    } else if (state?.message && !state?.success) {
      toast(state.message, 'error')
    }
  }, [state, toast, router])

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="flex items-center gap-3">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-sm text-slate-500 mt-1">{product.name}</p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={product.name}
                  required
                />
                {state?.errors?.name && (
                  <p className="text-xs text-red-500">{state.errors.name[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  defaultValue={product.sku || ''}
                  required
                />
                {state?.errors?.sku && (
                  <p className="text-xs text-red-500">{state.errors.sku[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={product.category || ''}
                  required
                />
                {state?.errors?.category && (
                  <p className="text-xs text-red-500">{state.errors.category[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseUnit">Base Unit *</Label>
                <Select
                  id="baseUnit"
                  name="baseUnit"
                  defaultValue={product.baseUnit}
                  required
                >
                  <option value="g">grams (g) — weight</option>
                  <option value="mL">millilitres (mL) — volume</option>
                  <option value="unit">units (count)</option>
                </Select>
                {state?.errors?.baseUnit && (
                  <p className="text-xs text-red-500">{state.errors.baseUnit[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePricePerBaseUnit">
                  Price per Base Unit (INR) *
                </Label>
                <Input
                  id="basePricePerBaseUnit"
                  name="basePricePerBaseUnit"
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  defaultValue={product.basePricePerBaseUnit}
                  required
                />
                {state?.errors?.basePricePerBaseUnit && (
                  <p className="text-xs text-red-500">
                    {state.errors.basePricePerBaseUnit[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockInBaseUnit">Stock (in base units) *</Label>
                <Input
                  id="stockInBaseUnit"
                  name="stockInBaseUnit"
                  type="number"
                  step="0.00000001"
                  min="0"
                  defaultValue={product.stockInBaseUnit}
                  required
                />
                {state?.errors?.stockInBaseUnit && (
                  <p className="text-xs text-red-500">{state.errors.stockInBaseUnit[0]}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={product.description || ''}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/admin/products">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
