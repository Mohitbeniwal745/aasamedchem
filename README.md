# AasaMedChem IMS — Inventory & Order Management System

A production-quality **Inventory and Order Management System** built for AasaMedChem, featuring role-based access, flexible unit conversions (weight/volume/count), and INR pricing with high decimal precision.

> **Live URL:** _[Add your Vercel deployment URL here]_

---

## Tech Stack

| Technology | Role |
|---|---|
| **Next.js 16** (App Router, TypeScript) | Full-stack framework |
| **Neon PostgreSQL** | Serverless database |
| **Drizzle ORM** + drizzle-kit | ORM & schema migrations |
| **NextAuth.js v5** (Auth.js) | Authentication (credentials + JWT) |
| **Tailwind CSS v4** | Styling |
| **Custom UI Components** | Built with CVA + Tailwind |
| **Zod** | Server-side validation |
| **Vercel** | Deployment |

---

## System Design

```
┌──────────────┐         ┌──────────────────────────┐         ┌────────────────┐
│              │  HTTP    │                          │  SQL    │                │
│   Browser    │────────→│   Next.js Server         │────────→│   Neon         │
│   (React)    │←────────│   (Server Actions +      │←────────│   PostgreSQL   │
│              │  HTML/   │    API Routes)           │  Query  │                │
│              │  JSON    │                          │  Result │                │
└──────────────┘         └──────────────────────────┘         └────────────────┘
                                    │
                                    ├── lib/auth.ts      → NextAuth JWT sessions
                                    ├── lib/units.ts     → Unit conversion logic
                                    ├── lib/actions/     → Server Actions (CRUD)
                                    ├── drizzle/schema   → DB schema definitions
                                    └── middleware.ts    → RBAC route protection
```

**Flow:**
1. Browser sends requests to Next.js running on Vercel
2. Server Components fetch data directly via Drizzle ORM → Neon PostgreSQL
3. Client Components call Server Actions for mutations (create, update, delete)
4. Middleware intercepts requests to enforce role-based access
5. All unit conversions happen in `lib/units.ts` — `toBaseUnit()` before DB writes, `fromBaseUnit()` before display

---

## Database Schema

### `users`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `email` | `TEXT` | NOT NULL, UNIQUE |
| `password` | `TEXT` | NOT NULL (bcrypt hash) |
| `name` | `TEXT` | NOT NULL |
| `role` | `TEXT` | NOT NULL, CHECK IN (`'admin'`, `'seller'`) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

### `products`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `name` | `TEXT` | NOT NULL |
| `sku` | `TEXT` | UNIQUE |
| `description` | `TEXT` | |
| `category` | `TEXT` | |
| `base_unit` | `TEXT` | NOT NULL, CHECK IN (`'g'`, `'mL'`, `'unit'`) |
| `base_price_per_base_unit` | `NUMERIC(20,8)` | NOT NULL — INR per 1 base unit |
| `stock_in_base_unit` | `NUMERIC(20,8)` | NOT NULL, DEFAULT `0` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Indexes:** `products_name_idx` (name), `products_category_idx` (category)

### `orders`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `user_id` | `UUID` | FK → `users.id` |
| `status` | `TEXT` | NOT NULL, DEFAULT `'pending'`, CHECK IN (`'pending'`, `'confirmed'`, `'fulfilled'`, `'cancelled'`) |
| `total_inr` | `NUMERIC(20,8)` | NOT NULL |
| `notes` | `TEXT` | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `now()` |

**Indexes:** `orders_user_id_idx` (user_id)

### `order_items`

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, `gen_random_uuid()` |
| `order_id` | `UUID` | FK → `orders.id` ON DELETE CASCADE |
| `product_id` | `UUID` | FK → `products.id` |
| `ordered_qty_base` | `NUMERIC(20,8)` | NOT NULL — always in base unit (source of truth) |
| `ordered_unit` | `TEXT` | NOT NULL — the unit the user chose (for display) |
| `ordered_qty_display` | `NUMERIC(20,8)` | NOT NULL — qty in user's chosen unit (for display) |
| `unit_price_inr` | `NUMERIC(20,8)` | NOT NULL — snapshot of base price at order time |
| `line_total_inr` | `NUMERIC(20,8)` | NOT NULL — `ordered_qty_base × unit_price_inr` |

**Indexes:** `order_items_order_id_idx` (order_id)

### Why `NUMERIC(20,8)` instead of `FLOAT`?

- **Precision 20** = up to 12 integer digits → handles crore-level INR totals (₹99,99,99,99,999.99999999)
- **Scale 8** = 8 decimal places → handles sub-paisa rates (e.g. ₹0.00001 per mL for bulk chemicals)
- **NEVER use FLOAT/REAL** for money — binary floating point causes rounding errors (e.g. 0.1 + 0.2 ≠ 0.3)
- PostgreSQL `NUMERIC` uses arbitrary-precision decimal arithmetic, so calculations are exact

---

## Unit Storage & Conversion Strategy

### Base Units

All quantities are stored in the database in their **base unit**:

| Dimension | Base Unit | Display Units |
|---|---|---|
| Weight | `g` (grams) | `g`, `kg` |
| Volume | `mL` (millilitres) | `mL`, `L` |
| Count | `unit` | `unit` |

### Conversion Factors

| From | To | Factor |
|---|---|---|
| 1 kg | g | × 1000 |
| 1 L | mL | × 1000 |
| 1 g | g | × 1 (identity) |
| 1 mL | mL | × 1 (identity) |
| 1 unit | unit | × 1 (identity) |

### Conversion Rules

1. **`toBaseUnit(qty, unit)` — called ONLY before saving to DB**
   - Example: User orders 5 L → `toBaseUnit(5, 'L')` = 5000 mL → stored as `ordered_qty_base = 5000`

2. **`fromBaseUnit(baseQty, targetUnit)` — called ONLY before displaying to user**
   - Example: Stock is 50000 mL → `fromBaseUnit(50000, 'L')` = 50 L → displayed as "50.00 L"

3. **`calculateLineTotal(orderedQtyBase, basePricePerBaseUnit)`**
   - Always computed in base units: `5000 mL × ₹0.25/mL = ₹1,250.00`

4. **`validateUnitCompatible(productBaseUnit, chosenUnit)`**
   - Weight products can ONLY be ordered in `g` or `kg`
   - Volume products can ONLY be ordered in `mL` or `L`
   - Count products can ONLY be ordered in `unit`
   - Cross-dimension orders are rejected (e.g. ordering a weight product in litres)

### Where Conversions Are Applied

| Location | Conversion | Function |
|---|---|---|
| `lib/actions/orders.ts` (placeOrder) | User qty → base unit before saving | `toBaseUnit()` |
| `app/seller/catalogue-client.tsx` | Live price preview | `toBaseUnit()` + `calculateLineTotal()` |
| `app/seller/cart/page.tsx` | Cart line totals | `toBaseUnit()` + `calculateLineTotal()` |
| `app/admin/products/page.tsx` | Human-readable stock display | `humanReadableStock()` → `fromBaseUnit()` |
| `app/admin/inventory/page.tsx` | Stock display | `humanReadableStock()` → `fromBaseUnit()` |
| All INR displays | Currency formatting | `formatINR()` |

---

## Price Storage

- All prices stored as `NUMERIC(20,8)` in **INR**
- `base_price_per_base_unit`: price per 1 base unit (e.g. ₹0.25 per mL)
- `unit_price_inr` in `order_items`: **snapshot** of the price at order time (so price changes don't affect historical orders)
- `line_total_inr = ordered_qty_base × unit_price_inr`
- Display: rounded to 2 decimal places using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd aasamedchem

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your actual values:
#   DATABASE_URL=your-neon-pooled-connection-string
#   NEXTAUTH_SECRET=your-random-32-char-string
#   NEXTAUTH_URL=http://localhost:3000

# 4. Push schema to Neon
npm run db:push

# 5. Seed test data
npm run db:seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the test credentials below.

---

## Vercel Deployment

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL` — your Neon pooled connection string
   - `NEXTAUTH_SECRET` — a random 32-character string
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://aasamedchem.vercel.app`)
4. Deploy — Vercel will build and deploy automatically
5. Re-deployment is automatic on every `git push` to the main branch

---

## Test Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@test.com` | `Admin123!` |
| **Seller** | `seller@test.com` | `Seller123!` |

---

## Usage Walkthrough

### 1. Admin Creates a Product
1. Log in as `admin@test.com` / `Admin123!`
2. Navigate to **Products** → **Add Product**
3. Fill in name, SKU, category, base unit (e.g. `mL`), price per base unit (e.g. `0.25`), and stock
4. Click **Create Product**
5. Verify the product appears in the products list with correct human-readable stock

### 2. Seller Searches and Adds to Cart
1. Log out and log in as `seller@test.com` / `Seller123!`
2. Browse the **Catalogue** — products are shown as cards with price per unit and available stock
3. Use the search bar to find a product (e.g. "Ethanol")
4. Click **Add to Cart** on a product
5. Choose quantity (e.g. `5`) and unit (e.g. `L` instead of `mL`)
6. See the live price preview update: 5 L = 5000 mL × ₹0.25/mL = ₹1,250.00
7. Click **Add** to add to cart

### 3. Seller Places an Order
1. Go to **Cart**
2. Review items — quantities and units are editable inline, prices recalculate live
3. Optionally add order notes
4. Click **Place Order**
5. Cart is cleared and you're redirected to **My Orders**
6. See the new order with status "Pending"

### 4. Admin Verifies Unit Conversions
1. Log in as admin and go to **Orders**
2. Click on the order you just placed
3. View the **Unit Conversion Audit** table:
   - See both the user's original input (e.g. "5.00 L") and the base-unit conversion (e.g. "5000.00 mL")
   - Verify: `unit_price = ₹0.25/mL`, `line_total = 5000 × 0.25 = ₹1,250.00`
4. Update order status (e.g. Pending → Confirmed → Fulfilled)

---

## Features Summary

### Admin Panel
- **Dashboard**: 4 metric cards (products, pending orders, revenue, low-stock), recent orders table
- **Products**: Full CRUD with Zod validation, human-readable stock display
- **Inventory**: Stock levels with amber highlighting for low-stock items (< 500 base units)
- **Orders**: Filterable by status, clickable for detail view
- **Order Detail**: Full conversion audit table showing display vs base quantities, status update

### Seller Panel
- **Catalogue**: Product grid with search, category filter, compatible unit selector, live price preview
- **Cart**: Editable quantities and units, live price recalculation, grand total, place order
- **My Orders**: Order history with expandable line items showing conversion details

### Authentication & Authorization
- NextAuth.js v5 with credential provider
- JWT sessions with role and ID
- Middleware-based route protection: `/admin/*` for admins only, `/seller/*` for admin + seller
- Redirect logic on login page

---

## License

This project was built as part of the AasaMedChem recruitment hackathon.
