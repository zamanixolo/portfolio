'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Project } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '@/app/admin/page.module.css';

interface Props {
    project: Project;
}

export default function AdminProjectItem({ project }: Props) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            router.refresh();
        } catch (e) {
            console.error(e);
            alert('Failed to delete project');
            setDeleting(false);
        }
    }

    return (
        <div className={styles.projectItem}>
            <div className={styles.projectInfo}>
                {project.coverImage ? (
                    <Image
                        src={project.coverImage}
                        alt={project.title}
                        width={60}
                        height={40}
                        className={styles.projectThumb}
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: 60, height: 40, background: '#333' }} />
                )}
                <span style={{ marginLeft: '1rem' }}>{project.title}</span>
            </div>
            <div className={styles.projectActions}>
                <Link href={`/work/${project.id}/edit`} className={styles.actionLink}>
                    Edit Layout
                </Link>
                <Link href={`/work/${project.id}`} className={styles.viewLink}>
                    View
                </Link>
                <button 
                    onClick={handleDelete} 
                    disabled={deleting}
                    style={{ 
                        marginLeft: '10px', 
                        color: '#ff4444', 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '0.875rem',
                        textDecoration: 'underline'
                    }}
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
}
