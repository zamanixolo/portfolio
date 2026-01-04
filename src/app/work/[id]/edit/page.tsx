import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import BlockEditor from '@/components/BlockEditor';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: PageProps) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: { blocks: true, gallery: true }
    });

    if (!project) notFound();

    return <BlockEditor project={project} />;
}
