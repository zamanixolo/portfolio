import Link from 'next/link';
import { prisma } from '@/lib/db';
import styles from './pages.module.css'; 

export const dynamic = 'force-dynamic';

export default async function AdminPagesList() {
    const pages = await prisma.page.findMany({
        orderBy: {
            slug: 'asc',
        },
    });

    return (
        <div className={styles.container}>
            <Link href="/admin" className={styles.backLink}>← Back to Admin</Link>
            <h1 className={styles.title}>Manage Site Pages</h1>

            <div className={styles.pageList}>
                {pages.length === 0 ? (
                    <p>No pages found. Make sure your database is seeded.</p>
                ) : (
                    pages.map((page) => (
                        <Link href={`/admin/pages/${page.slug}`} key={page.slug} className={styles.pageItem}>
                            <h2>{page.title || page.slug}</h2>
                            <p>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
                            <span className={styles.editButton}>Edit →</span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
