import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ALLOWED_EMAIL = 'borahanmirzaii@gmail.com'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public paths
  if (
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path === '/'
  ) {
    // For the home page, we'll let it load but check auth there
    if (path === '/') {
      return NextResponse.next()
    }
    return NextResponse.next()
  }

  // Protect API routes
  if (path.startsWith('/api/generate')) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // The actual token validation is done in the API route
    // This is just a first check
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
