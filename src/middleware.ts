import { NextRequest, NextResponse } from 'next/server'
import { requireAttorneyAuth, requireClientAuth } from '@/lib/firebase/admin'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Attorney portal routes
  if (pathname.startsWith('/admin')) {
    const authorization = request.headers.get('authorization')
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const idToken = authorization.split('Bearer ')[1]
    const user = await requireAttorneyAuth(idToken)

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  // Client portal routes
  if (pathname.startsWith('/portal')) {
    const authorization = request.headers.get('authorization')
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const idToken = authorization.split('Bearer ')[1]
    const user = await requireClientAuth(idToken)

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/portal/:path*']
}