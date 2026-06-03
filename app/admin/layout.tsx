'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  LogOut,
  FlaskConical,
  Menu,
  X,
  ClipboardList,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/requests', label: 'Requests', icon: ClipboardList },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/admin" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-wide">AasaMedChem</h1>
                <p className="text-[10px] text-slate-400 font-medium">Admin Panel</p>
              </div>
            </Link>

            {/* Desktop Navigation & Actions */}
            <div className="hidden md:flex items-center gap-2">
              <nav className="flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="w-px h-6 bg-slate-200 mx-2" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 animate-in slide-in-from-top-4 duration-200 shadow-inner">
            {navItems.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
            <div className="h-px bg-slate-200 my-2" />
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 w-full transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}
