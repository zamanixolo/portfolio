import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const data = await request.json(); // { type, content, width, order }

    try {
        const block = await prisma.block.create({
            data: {
                ...data,
                projectId: id
            }
        });
        return NextResponse.json(block);
    } catch (error) {
        console.error('Failed to create block:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // This is projectId, but we might accept a list of blocks to reorder
    const body = await request.json();

    try {
        // If array, it's a reorder operation
        if (Array.isArray(body)) {
            const updates = body.map((block: { id: string }, index: number) =>
                prisma.block.update({
                    where: { id: block.id },
                    data: { order: index }
                })
            );
            await prisma.$transaction(updates);
            return NextResponse.json({ success: true });
        }

        // Single update (content/width) handled by separate route usually, but let's see.
        // Actually, let's make a specific route for block updates /api/blocks/[blockId] ideally,
        // but for simplicity let's handle bulk updates here too?
        // Let's stick to Reorder here or standard updates. 

        // If it's a single object, maybe update that specific block (but we need blockId)
        // Let's do a separate route for singular updates.

        return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    } catch (error) {
        console.error('Failed to update blocks:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
