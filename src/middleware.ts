import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Attorney portal routes - basic auth check only
  // Detailed auth verification happens in pages/API routes
  if (pathname.startsWith('/admin')) {
    // Allow the page to handle authentication via AuthProvider
    return NextResponse.next()
  }

  // Client portal routes - basic auth check only
  if (pathname.startsWith('/portal')) {
    // Allow the page to handle authentication via AuthProvider
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*'],
}
