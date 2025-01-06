import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  // List of public paths that don't require authentication
  const publicPaths = ['/login', '/signup']
  
  // Get the token from cookies
  const token = request.cookies.get('auth-token')

  // Check if it's an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Verify token and check admin status
      const response = await fetch(new URL('/api/admin/check', request.url), {
        headers: {
          Cookie: `auth-token=${token?.value}`
        }
      })

      if (!response.ok) {
        // If not admin, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // On any error, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Handle regular authentication
  if (!token && !publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
} 