import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let body;
    
    try {
        body = await req.json();
        const { blocks, ...rest } = body; 

        // Extract only valid fields to prevent Prisma errors with relations (like gallery)
        const projectData = {
            description: rest.description,
            layoutAlignment: rest.layoutAlignment,
            coverImage: rest.coverImage,
            coverVideo: rest.coverVideo,
            title: rest.title,
            category: rest.category,
            date: rest.date,
            backgroundColor: rest.backgroundColor,
            textColor: rest.textColor
        };

        await prisma.$transaction(async (tx) => {
            // 1. Update Project fields
            await tx.project.update({
                where: { id },
                data: {
                    ...projectData
                }
            });

            if (blocks) {
                // 2. Handle Blocks
                // Get IDs of blocks currently in the request that look like UUIDs
                const validIds = blocks
                    .filter((b: any) => b.id && !b.id.startsWith('temp-'))
                    .map((b: any) => b.id);

                // Delete blocks not in the new list
                await tx.block.deleteMany({
                    where: {
                        projectId: id,
                        id: { notIn: validIds }
                    }
                });

                // Upsert/Create blocks
                for (const [index, block] of blocks.entries()) {
                    const blockData = {
                        type: block.type,
                        content: block.content,
                        width: block.width,
                        alignment: block.alignment,
                        autoplay: block.autoplay,
                        order: index, // Use the array index as order
                        projectId: id
                    };

                    if (block.id && !block.id.startsWith('temp-')) {
                        await tx.block.update({
                            where: { id: block.id },
                            data: blockData
                        });
                    } else {
                        await tx.block.create({
                            data: blockData
                        });
                    }
                }
            }
        });

        // Return the updated project with new blocks to sync client state
        const updatedProject = await prisma.project.findUnique({
            where: { id },
            include: { blocks: { orderBy: { order: 'asc' } }, gallery: true }
        });
        
        return NextResponse.json(updatedProject);
    } catch (e: any) {
        console.error("Sync error:", e);
        if (body) console.error("Sync payload:", JSON.stringify(body));
        return NextResponse.json({ error: `Failed to sync project: ${e.message}` }, { status: 500 });
    }
}
