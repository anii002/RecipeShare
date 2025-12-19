import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/recipes', '/api/auth'];
  
  // Check if the route is public
  if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    // Skip auth check for public API routes
    const publicApiRoutes = ['/api/auth', '/api/recipes/GET'];
    
    if (publicApiRoutes.some(route => 
        (request.nextUrl.pathname === '/api/recipes' && request.method === 'GET') ||
        request.nextUrl.pathname.startsWith('/api/auth')
    )) {
      return NextResponse.next();
    }
    
    // Check authentication for protected API routes
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  // Protected pages
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  const user = verifyToken(token);
  if (!user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/recipes/create',
    '/recipes/edit/:path*',
    '/profile/:path*',
    '/dashboard/:path*'
  ],
};