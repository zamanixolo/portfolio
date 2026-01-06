import Link from 'next/link';
import ProjectForm from '@/components/ProjectForm';
import ProjectListEditor from '@/components/ProjectListEditor';
import styles from './page.module.css';
import { Metadata } from 'next';
import { prisma } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const projects = await prisma.project.findMany({
        orderBy: [
            { order: 'asc' as const },
            { date: 'desc' }
        ]
    });

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>← Back to Site</Link>

            <section className={styles.section}>
                <h2 className={styles.subtitle}>Manage Content Pages</h2>
                <Link href="/admin/pages" className={styles.managePagesButton}>
                    Edit Pages
                </Link>
            </section>

            <section className={styles.section}>
                <h1 className={styles.title}>Add New Project</h1>
                <ProjectForm />
            </section>

            <section className={styles.section}>
                <h2 className={styles.subtitle}>Manage Projects</h2>
                <ProjectListEditor initialProjects={projects} />
            </section>
        </div>
    );
}
