'use client';

import { useState, useEffect } from 'react';
import { Reorder } from 'framer-motion';
import { Project } from '@prisma/client';
import AdminProjectItem from './AdminProjectItem';
import styles from '@/app/admin/page.module.css';

interface Props {
    initialProjects: Project[];
}

export default function ProjectListEditor({ initialProjects }: Props) {
    const [projects, setProjects] = useState(initialProjects);

    useEffect(() => {
        setProjects(initialProjects);
    }, [initialProjects]);

    async function handleReorder(newOrder: Project[]) {
        setProjects(newOrder);
        
        // Prepare payload with explicit order index
        const payload = newOrder.map((p, index) => ({ id: p.id, order: index }));
        
        try {
            await fetch('/api/projects/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: payload })
            });
        } catch (e) {
            console.error('Failed to save order', e);
        }
    }

    return (
        <Reorder.Group 
            axis="y" 
            values={projects} 
            onReorder={handleReorder} 
            className={styles.projectList}
        >
            {projects.map((project) => (
                <Reorder.Item 
                    key={project.id} 
                    value={project} 
                    style={{ position: 'relative', marginBottom: '10px' }}
                >
                    <AdminProjectItem project={project} />
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
}
