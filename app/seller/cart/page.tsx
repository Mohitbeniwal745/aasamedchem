'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  formatINR,
  toBaseUnit,
  calculateLineTotal,
  COMPATIBLE_UNITS,
  CONVERSION_TO_BASE,
  type AnyUnit,
} from '@/lib/units'
import { placeOrder, type CartItem } from '@/lib/actions/orders'
import { Trash2, ShoppingCart, Loader2 } from 'lucide-react'

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const loadCart = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('aasamedchem-cart') || '[]')
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    setCart(loadCart())
    setMounted(true)
  }, [loadCart])

  const saveCart = useCallback(
    (newCart: CartItem[]) => {
      setCart(newCart)
      localStorage.setItem('aasamedchem-cart', JSON.stringify(newCart))
    },
    []
  )

  function updateQuantity(index: number, qty: number) {
    const newCart = [...cart]
    newCart[index].quantity = qty
    saveCart(newCart)
  }

  function updateUnit(index: number, unit: AnyUnit) {
    const newCart = [...cart]
    newCart[index].unit = unit
    saveCart(newCart)
  }

  function removeItem(index: number) {
    const newCart = cart.filter((_, i) => i !== index)
    saveCart(newCart)
    toast('Item removed from cart', 'info')
  }

  function getLineTotal(item: CartItem): number {
    const baseQty = toBaseUnit(item.quantity, item.unit)
    return calculateLineTotal(baseQty, item.basePricePerBaseUnit)
  }

  function getGrandTotal(): number {
    return cart.reduce((sum, item) => sum + getLineTotal(item), 0)
  }

  function getUnitPrice(item: CartItem): number {
    // Price per chosen unit = base_price * conversion_factor
    return item.basePricePerBaseUnit * CONVERSION_TO_BASE[item.unit]
  }

  async function handlePlaceOrder() {
    if (cart.length === 0) return
    setLoading(true)

    const result = await placeOrder(cart, notes || undefined)
    setLoading(false)

    if (result.success) {
      localStorage.removeItem('aasamedchem-cart')
      setCart([])
      toast('Order placed successfully!', 'success')
      router.push('/seller/orders')
    } else {
      toast(result.message || 'Failed to place order', 'error')
    }
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-in">
        <h1 className="text-2xl font-bold text-slate-900">Cart</h1>
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center text-slate-500">
            Loading...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cart / Quotation Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review items, adjust quantities and units, then place your order
        </p>
      </div>

      {cart.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Your cart is empty</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/seller')}
            >
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cart Table */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Cart Items ({cart.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-2 font-medium text-slate-500">
                        Product
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-slate-500">
                        Qty
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-slate-500">
                        Unit
                      </th>
                      <th className="text-right py-3 px-2 font-medium text-slate-500">
                        Unit Price
                      </th>
                      <th className="text-right py-3 px-2 font-medium text-slate-500">
                        Line Total
                      </th>
                      <th className="text-center py-3 px-2 font-medium text-slate-500">
                        Remove
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => {
                      const compatibleUnits =
                        COMPATIBLE_UNITS[item.baseUnit] || [
                          item.baseUnit as AnyUnit,
                        ]
                      return (
                        <tr
                          key={`${item.productId}-${item.unit}-${index}`}
                          className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-2">
                            <p className="font-medium text-slate-900">
                              {item.productName}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              {item.sku}
                            </p>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  index,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24 mx-auto text-center"
                            />
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Select
                              value={item.unit}
                              onChange={(e) =>
                                updateUnit(
                                  index,
                                  e.target.value as AnyUnit
                                )
                              }
                              className="w-20 mx-auto"
                            >
                              {compatibleUnits.map((u) => (
                                <option key={u} value={u}>
                                  {u}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="py-3 px-2 text-right text-slate-600">
                            {formatINR(getUnitPrice(item))}/{item.unit}
                          </td>
                          <td className="py-3 px-2 text-right text-slate-900 font-semibold">
                            {formatINR(getLineTotal(item))}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200">
                      <td
                        colSpan={4}
                        className="py-4 px-2 text-right font-semibold text-slate-700 text-base"
                      >
                        Grand Total
                      </td>
                      <td className="py-4 px-2 text-right text-xl font-bold text-indigo-700">
                        {formatINR(getGrandTotal())}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Place Order */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Order Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {cart.length} item(s) · {formatINR(getGrandTotal())}
                  </p>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={loading || cart.length === 0}
                    size="lg"
                    className="min-w-[160px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
