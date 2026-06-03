'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Store,
  ShoppingCart,
  ClipboardList,
  LogOut,
  FlaskConical,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/seller', label: 'Catalogue', icon: Store },
  { href: '/seller/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/seller/orders', label: 'My Orders', icon: ClipboardList },
  { href: '/seller/requests', label: 'Custom Requests', icon: HelpCircle },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/seller" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">AasaMedChem</h1>
                <p className="text-xs text-slate-400">Seller Portal</p>
              </div>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === '/seller'
                    ? pathname === '/seller'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
              <div className="w-px h-6 bg-slate-200 mx-2" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  )
}
