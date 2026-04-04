import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'barberos_session'

const protectedPaths = ['/dashboard']
const publicPaths = ['/login', '/', '/book', '/api/auth/login', '/api/book']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path))
  const isApiDashboard = pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/book')

  // Se é rota protegida e não tem sessão, redirecionar para login
  if ((isProtectedRoute || isApiDashboard) && !sessionId) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Se está na página de login e já tem sessão, redirecionar para dashboard
  if (pathname === '/login' && sessionId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
