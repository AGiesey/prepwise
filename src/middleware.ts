import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/recipes/new',
  '/recipes/edit',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/login'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const providerType = process.env.AUTH_PROVIDER || 'mock';

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Skip Auth0 API routes - they handle their own auth
  if (pathname.startsWith('/api/auth/') && providerType.toLowerCase() === 'auth0') {
    return NextResponse.next();
  }

  // Skip API routes - let them handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  let isAuthenticated = false;

  // Check authentication based on provider
  if (providerType.toLowerCase() === 'auth0') {
    // For Auth0, check for session cookie (Auth0 SDK uses appSession cookie)
    // The cookie name may vary, so check common patterns
    const hasAuth0Session = request.cookies.get('appSession')?.value || 
                           request.cookies.get('appSession.0')?.value ||
                           request.cookies.get('a0:session')?.value;
    isAuthenticated = !!hasAuth0Session;
  } else {
    // For other providers, check auth-token cookie
    const authToken = request.cookies.get('auth-token')?.value;
    isAuthenticated = !!authToken;
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 