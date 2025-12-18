import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('admin-auth')?.value
  const payload = token ? verifyToken(token) : null
  const isAuthenticated = payload !== null
  const isAdmin = payload?.role === 'admin'

  if (pathname === '/admin/login') {
    if (isAuthenticated && isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (!isAuthenticated || !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

