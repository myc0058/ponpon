import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, password } = body;

        const adminId = process.env.ADMIN_ID;
        const adminPwd = process.env.ADMIN_PWD;

        if (id === adminId && password === adminPwd) {
            // In a real app, use a proper session token or JWT.
            // For this simple case, we'll use a hardcoded token.
            const response = NextResponse.json({ success: true });

            // Set 1 week expiration
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            response.cookies.set('admin_session', 'authenticated_myc0058', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                expires,
            });

            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'An error occurred' }, { status: 500 });
    }
}
