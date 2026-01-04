import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Hardcoded credentials for simplicity as per plan
    // In production, use env vars
    const isValid = body.password === 'password';

    if (isValid) {
        const response = NextResponse.json({ success: true });
        // Set HTTP-only cookie
        response.cookies.set('admin_token', 'true', {
            httpOnly: false, // Allow client JS (AdminProvider) to read existence for UI state
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
