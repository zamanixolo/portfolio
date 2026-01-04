import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const slug = (await params).slug;
        const pages = await prisma.$queryRaw<any[]>`SELECT * FROM Page WHERE slug = ${slug} LIMIT 1`;
        const page = pages[0];

        if (!page) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        return NextResponse.json({ ...page, content: JSON.parse(page.content) });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const slug = (await params).slug;
    const body = await request.json();
    const newContent = JSON.stringify(body.content);
    const now = new Date().toISOString();

    // Validate existence
    const pages = await prisma.$queryRaw<any[]>`SELECT * FROM Page WHERE slug = ${slug} LIMIT 1`;
    if (pages.length === 0) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    try {
        await prisma.$executeRaw`UPDATE Page SET content = ${newContent}, updatedAt = ${now} WHERE slug = ${slug}`;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
