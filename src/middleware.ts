import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except /admin/login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const session = request.cookies.get('admin_session');

        if (!session || session.value !== 'authenticated_myc0058') {
            const loginUrl = new URL('/admin/login', request.url);
            // Optionally add the original path to redirect back after login
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/admin/:path*',
};
