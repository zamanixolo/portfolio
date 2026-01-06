import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ imageId: string }> }
) {
    const { imageId } = await params;
    try {
        await prisma.projectImage.delete({
            where: { id: imageId }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
