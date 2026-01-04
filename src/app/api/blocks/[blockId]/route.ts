import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ blockId: string }> }
) {
    const { blockId } = await params;
    const data = await request.json(); // { content, width, type... }

    try {
        const block = await prisma.block.update({
            where: { id: blockId },
            data
        });
        return NextResponse.json(block);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ blockId: string }> }
) {
    const { blockId } = await params;
    try {
        await prisma.block.delete({
            where: { id: blockId }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
