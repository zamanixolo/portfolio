import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { date: 'desc' },
            include: { gallery: true }
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { title, category, description, coverImage, coverVideo, webLink, gallery } = data;

        const project = await prisma.project.create({
            data: {
                title,
                category,
                description,
                coverImage,
                coverVideo,
                webLink,
                gallery: {
                    create: gallery?.map((img: { url: string; caption?: string }) => ({
                        url: img.url,
                        caption: img.caption
                    })) || []
                }
            },
            include: { gallery: true }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
