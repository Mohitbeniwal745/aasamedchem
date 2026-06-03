import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import bcrypt from 'bcryptjs'
import { users, products } from './schema'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local')
}

const sql = neon(process.env.DATABASE_URL)
const db = drizzle(sql)

async function seed() {
  console.log('🌱 Seeding database...')

  // ─── Users ───────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const sellerPassword = await bcrypt.hash('Seller123!', 12)

  await db
    .insert(users)
    .values([
      {
        email: 'admin@test.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
      },
      {
        email: 'seller@test.com',
        password: sellerPassword,
        name: 'Seller User',
        role: 'seller',
      },
    ])
    .onConflictDoNothing()

  console.log('✅ Users seeded')

  // ─── Products ────────────────────────────────────────────────────
  // 8 products across chemicals, solvents, reagents
  await db
    .insert(products)
    .values([
      {
        name: 'Ethanol (Absolute)',
        sku: 'ETH-001',
        description:
          'Absolute ethanol, 99.9% pure, suitable for HPLC and spectroscopy',
        category: 'Solvents',
        baseUnit: 'mL',
        basePricePerBaseUnit: '0.25000000', // ₹0.25 per mL = ₹250 per L
        stockInBaseUnit: '50000.00000000', // 50 L
      },
      {
        name: 'Methanol (HPLC Grade)',
        sku: 'MET-002',
        description:
          'HPLC grade methanol with ultra-low UV absorption',
        category: 'Solvents',
        baseUnit: 'mL',
        basePricePerBaseUnit: '0.30000000', // ₹0.30 per mL = ₹300 per L
        stockInBaseUnit: '25000.00000000', // 25 L
      },
      {
        name: 'Sodium Chloride (NaCl)',
        sku: 'NAC-003',
        description:
          'AR grade sodium chloride for laboratory use',
        category: 'Chemicals',
        baseUnit: 'g',
        basePricePerBaseUnit: '0.05000000', // ₹0.05 per g = ₹50 per kg
        stockInBaseUnit: '100000.00000000', // 100 kg
      },
      {
        name: 'Potassium Permanganate (KMnO₄)',
        sku: 'KMN-004',
        description:
          'AR grade potassium permanganate, strong oxidising agent',
        category: 'Reagents',
        baseUnit: 'g',
        basePricePerBaseUnit: '0.80000000', // ₹0.80 per g = ₹800 per kg
        stockInBaseUnit: '5000.00000000', // 5 kg
      },
      {
        name: 'Acetone (Technical Grade)',
        sku: 'ACE-005',
        description: 'Technical grade acetone for general cleaning and degreasing',
        category: 'Solvents',
        baseUnit: 'mL',
        basePricePerBaseUnit: '0.18000000', // ₹0.18 per mL = ₹180 per L
        stockInBaseUnit: '100000.00000000', // 100 L
      },
      {
        name: 'Silver Nitrate (AgNO₃)',
        sku: 'AGN-006',
        description:
          'AR grade silver nitrate for analytical chemistry',
        category: 'Reagents',
        baseUnit: 'g',
        basePricePerBaseUnit: '12.50000000', // ₹12.50 per g = ₹12,500 per kg
        stockInBaseUnit: '250.00000000', // 250 g (low stock)
      },
      {
        name: 'pH Buffer Solution (pH 7.0)',
        sku: 'PHB-007',
        description:
          'Standard pH 7.0 buffer solution for calibration',
        category: 'Reagents',
        baseUnit: 'mL',
        basePricePerBaseUnit: '0.10000000', // ₹0.10 per mL = ₹100 per L
        stockInBaseUnit: '10000.00000000', // 10 L
      },
      {
        name: 'Glass Beakers (250 mL)',
        sku: 'GBK-008',
        description:
          'Borosilicate glass beakers, 250 mL capacity, pack of 1',
        category: 'Labware',
        baseUnit: 'unit',
        basePricePerBaseUnit: '185.00000000', // ₹185 per unit
        stockInBaseUnit: '120.00000000', // 120 units
      },
    ])
    .onConflictDoNothing()

  console.log('✅ Products seeded')
  console.log('🎉 Seeding complete!')
  console.log('')
  console.log('Test credentials:')
  console.log('  Admin:  admin@test.com  / Admin123!')
  console.log('  Seller: seller@test.com / Seller123!')
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err)
  process.exit(1)
})
