import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const project = await prisma.project.findUnique({
            where: { id },
            include: { gallery: true, blocks: true }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const currentBlockCount = project.blocks.length;

        // Create a transaction to ensure all or nothing
        await prisma.$transaction(async (tx) => {
            // Create blocks from gallery images
            for (let i = 0; i < project.gallery.length; i++) {
                const img = project.gallery[i];
                await tx.block.create({
                    data: {
                        type: 'image',
                        content: img.url,
                        order: currentBlockCount + i,
                        width: 'full',
                        projectId: id
                    }
                });
            }

            // Delete migrated gallery images
            await tx.projectImage.deleteMany({
                where: { projectId: id }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Migration failed:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
