import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
    title: 'About | Portfolio',
    description: 'Background and philosophy.',
};

import { prisma } from '@/lib/db';

async function getAboutContent() {
    try {
        const slug = 'about';
        const pages = await prisma.$queryRaw<any[]>`SELECT * FROM Page WHERE slug = ${slug} LIMIT 1`;
        return pages[0] ? JSON.parse(pages[0].content) : null;
    } catch (error) {
        console.error('Error fetching about content:', error);
        return null;
    }
}

import EditableAbout from '@/components/EditableAbout';

export default async function AboutPage() {
    const content = await getAboutContent();

    if (!content) return <div>Loading...</div>;

    return <EditableAbout initialContent={content} />;
}
