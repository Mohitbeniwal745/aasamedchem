// lib/units.ts — ALL conversion logic lives here and ONLY here.

export type WeightUnit = 'g' | 'kg'
export type VolumeUnit = 'mL' | 'L'
export type CountUnit = 'unit'
export type AnyUnit = WeightUnit | VolumeUnit | CountUnit

export type Dimension = 'weight' | 'volume' | 'count'

export const BASE_UNITS: Record<Dimension, AnyUnit> = {
  weight: 'g',
  volume: 'mL',
  count: 'unit',
} as const

/**
 * Multiplier to convert 1 of the given unit INTO its base unit.
 * e.g. 1 kg = 1000 g  →  CONVERSION_TO_BASE['kg'] = 1000
 */
export const CONVERSION_TO_BASE: Record<AnyUnit, number> = {
  g: 1,
  kg: 1000,
  mL: 1,
  L: 1000,
  unit: 1,
}

/** Maps each unit to its dimension family. */
export const UNIT_DIMENSION: Record<AnyUnit, Dimension> = {
  g: 'weight',
  kg: 'weight',
  mL: 'volume',
  L: 'volume',
  unit: 'count',
}

/** Given a base unit, returns all compatible display units. */
export const COMPATIBLE_UNITS: Record<string, AnyUnit[]> = {
  g: ['g', 'kg'],
  mL: ['mL', 'L'],
  unit: ['unit'],
}

/** Human-readable labels for each unit. */
export const UNIT_LABELS: Record<AnyUnit, string> = {
  g: 'grams',
  kg: 'kilograms',
  mL: 'millilitres',
  L: 'litres',
  unit: 'units',
}

/**
 * Convert a quantity in any unit to its base unit.
 * Call ONLY before saving to DB.
 */
export function toBaseUnit(qty: number, unit: AnyUnit): number {
  return qty * CONVERSION_TO_BASE[unit]
}

/**
 * Convert a base-unit quantity to a display unit.
 * Call ONLY before displaying to the user.
 */
export function fromBaseUnit(baseQty: number, targetUnit: AnyUnit): number {
  return baseQty / CONVERSION_TO_BASE[targetUnit]
}

/**
 * Calculate line total in INR.
 * orderedQtyBase is always in the base unit (g / mL / unit).
 */
export function calculateLineTotal(
  orderedQtyBase: number,
  basePricePerBaseUnit: number
): number {
  return orderedQtyBase * basePricePerBaseUnit
}

/**
 * Check if the chosen display unit is compatible with the product's base unit.
 * e.g. a product stored in 'g' can be ordered in 'g' or 'kg', but NOT 'mL'.
 */
export function validateUnitCompatible(
  productBaseUnit: string,
  chosenUnit: AnyUnit
): boolean {
  return COMPATIBLE_UNITS[productBaseUnit]?.includes(chosenUnit) ?? false
}

/**
 * Format a number as Indian Rupee currency string.
 * Always use this for displaying prices — never raw numbers.
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Convert a base-unit stock quantity into a human-readable string.
 * e.g. 2500 g → "2.50 kg", 500 mL → "500.00 mL"
 */
export function humanReadableStock(
  stockInBase: number,
  baseUnit: AnyUnit
): string {
  const compatibleUnits = COMPATIBLE_UNITS[baseUnit] ?? [baseUnit]
  // Pick the largest unit where the value >= 1
  for (let i = compatibleUnits.length - 1; i >= 0; i--) {
    const u = compatibleUnits[i]
    const converted = fromBaseUnit(stockInBase, u)
    if (converted >= 1 || i === 0) {
      return `${converted.toFixed(2)} ${u}`
    }
  }
  return `${stockInBase.toFixed(2)} ${baseUnit}`
}

/**
 * Format price per unit in a human-readable way.
 * e.g. base_price = 0.25 per mL → "₹0.25/mL = ₹250.00/L"
 */
export function formatPricePerUnit(
  basePricePerBaseUnit: number,
  baseUnit: AnyUnit
): string {
  const compatibleUnits = COMPATIBLE_UNITS[baseUnit] ?? [baseUnit]
  const parts = compatibleUnits.map((u) => {
    const pricePerUnit = basePricePerBaseUnit * CONVERSION_TO_BASE[u]
    return `${formatINR(pricePerUnit)}/${u}`
  })
  return parts.join(' = ')
}
