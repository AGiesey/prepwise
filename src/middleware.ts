import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Let Auth0 handle its own routes (login, callback, etc.)
  if (pathname.startsWith('/api/auth')) {
    return await auth0.middleware(request);
  }

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/profile', '/recipes'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    const session = await auth0.getSession(request);
    
    if (!session || !session.user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // For all other routes, let Auth0 middleware handle them (for session management)
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};