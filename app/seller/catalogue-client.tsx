'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import {
  formatINR,
  formatPricePerUnit,
  humanReadableStock,
  COMPATIBLE_UNITS,
  toBaseUnit,
  calculateLineTotal,
  type AnyUnit,
} from '@/lib/units'
import { Search, ShoppingCart, Package, HelpCircle } from 'lucide-react'
import type { Product } from '@/drizzle/schema'
import Link from 'next/link'

type CartItem = {
  productId: string
  productName: string
  sku: string
  quantity: number
  unit: AnyUnit
  baseUnit: string
  basePricePerBaseUnit: number
}

interface CatalogueClientProps {
  initialProducts: Product[]
  categories: string[]
  initialSearch: string
  initialCategory: string
}

export function CatalogueClient({
  initialProducts,
  categories,
  initialSearch,
  initialCategory,
}: CatalogueClientProps) {
  const [search, setSearch] = useState(initialSearch)
  const [category, setCategory] = useState(initialCategory)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [units, setUnits] = useState<Record<string, AnyUnit>>({})
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set('search', search)
      else params.delete('search')
      if (category && category !== 'all') params.set('category', category)
      else params.delete('category')
      router.push(`/seller?${params.toString()}`)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, category, router, searchParams])

  // Load cart from localStorage
  const getCart = useCallback((): CartItem[] => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(localStorage.getItem('aasamedchem-cart') || '[]')
    } catch {
      return []
    }
  }, [])

  const saveCart = useCallback((cart: CartItem[]) => {
    localStorage.setItem('aasamedchem-cart', JSON.stringify(cart))
  }, [])

  function addToCart(product: Product) {
    const qty = quantities[product.id] || 1
    const unit = units[product.id] || (product.baseUnit as AnyUnit)

    if (qty <= 0) {
      toast('Quantity must be greater than 0', 'error')
      return
    }

    const cart = getCart()
    const existingIdx = cart.findIndex(
      (item) => item.productId === product.id && item.unit === unit
    )

    if (existingIdx >= 0) {
      cart[existingIdx].quantity += qty
    } else {
      cart.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku || '',
        quantity: qty,
        unit,
        baseUnit: product.baseUnit,
        basePricePerBaseUnit: Number(product.basePricePerBaseUnit),
      })
    }

    saveCart(cart)
    setSelectedProduct(null)
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
    toast(`${product.name} added to cart`, 'success')
  }

  function getLivePrice(product: Product): string {
    const qty = quantities[product.id] || 1
    const unit = units[product.id] || (product.baseUnit as AnyUnit)
    const baseQty = toBaseUnit(qty, unit)
    const lineTotal = calculateLineTotal(baseQty, Number(product.basePricePerBaseUnit))
    return formatINR(lineTotal)
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Catalogue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse products, configure quantities, and add to cart
          </p>
        </div>
        <Link href="/seller/requests">
          <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer">
            <HelpCircle className="w-4 h-4 mr-2" />
            Request Unlisted Product
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </div>

      {/* Product Grid */}
      {initialProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialProducts.map((product) => {
            const isSelected = selectedProduct === product.id
            const compatibleUnits =
              COMPATIBLE_UNITS[product.baseUnit] || [product.baseUnit as AnyUnit]
            const currentUnit =
              units[product.id] || (product.baseUnit as AnyUnit)
            const currentQty = quantities[product.id] || 1

            return (
              <Card
                key={product.id}
                className="border-0 shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
              >
                <CardContent className="p-5">
                  {/* Product info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {product.sku}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {product.category}
                    </Badge>
                  </div>

                  {product.description && (
                    <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-3 p-2.5 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-0.5">Price</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatPricePerUnit(
                        Number(product.basePricePerBaseUnit),
                        product.baseUnit as AnyUnit
                      )}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="flex items-center justify-between mb-4 text-xs">
                    <span className="text-slate-500">Available Stock</span>
                    <span className="font-medium text-slate-700">
                      {humanReadableStock(
                        Number(product.stockInBaseUnit),
                        product.baseUnit as AnyUnit
                      )}
                    </span>
                  </div>

                  {/* Add to cart */}
                  {!isSelected ? (
                    <Button
                      onClick={() => setSelectedProduct(product.id)}
                      variant="outline"
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  ) : (
                    <div className="space-y-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0.01"
                          step="any"
                          value={currentQty}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [product.id]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="flex-1"
                          placeholder="Qty"
                        />
                        <Select
                          value={currentUnit}
                          onChange={(e) =>
                            setUnits((prev) => ({
                              ...prev,
                              [product.id]: e.target.value as AnyUnit,
                            }))
                          }
                          className="w-20"
                        >
                          {compatibleUnits.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </Select>
                      </div>

                      {/* Live price preview */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Total:</span>
                        <span className="font-bold text-indigo-700">
                          {getLivePrice(product)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => addToCart(product)}
                          size="sm"
                          className="flex-1"
                        >
                          Add
                        </Button>
                        <Button
                          onClick={() => setSelectedProduct(null)}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
