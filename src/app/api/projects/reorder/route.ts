import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { items } = body; // Expect items: { id: string, order: number }[]

        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Transaction for bulk update
        await prisma.$transaction(
            items.map((item: any) => 
                prisma.project.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 });
    }
}
