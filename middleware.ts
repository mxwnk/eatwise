/**
 * Middleware – protects all /admin routes with HTTP Basic Auth.
 *
 * The password is read from the ADMIN_PASSWORD environment variable.
 * If ADMIN_PASSWORD is not set, the admin routes are accessible without authentication.
 * The username can be anything — only the password is validated.
 */
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    return NextResponse.next()
  }

  if (authHeader) {
    const encoded = authHeader.split(' ')[1]
    if (encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
      const [, pass] = decoded.split(':')
      if (pass === password) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="EatWise Admin"',
    },
  })
}

export const config = {
  matcher: ['/admin/:path*'],
}
