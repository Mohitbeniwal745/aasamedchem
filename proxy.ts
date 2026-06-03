import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl
  const user = session?.user as { role?: string } | undefined

  // Already logged in? Redirect away from login page
  if (pathname === '/login' && user) {
    const dest = user.role === 'admin' ? '/admin' : '/seller'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Admin routes: require admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/seller', request.url))
    }
  }

  // Seller routes: require admin or seller role
  if (pathname.startsWith('/seller')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.role !== 'admin' && user.role !== 'seller') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*', '/login'],
}
