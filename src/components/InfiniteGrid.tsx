'use client';

import { useState, useEffect, useRef } from 'react';
import { Project } from '@prisma/client';
import ProjectCard from './ProjectCard';
import Hero from './Hero';
import styles from '@/app/page.module.css';

interface InfiniteGridProps {
    initialProjects: Project[];
}

interface DisplayItem {
    project: Project;
    uniqueId: string;
}

export default function InfiniteGrid({ initialProjects }: InfiniteGridProps) {
    const [items, setItems] = useState<DisplayItem[]>(() => 
        initialProjects.map((p, i) => ({ project: p, uniqueId: `init-${i}` }))
    );
    
    const bottomSentinelRef = useRef<HTMLDivElement>(null);

    const generateItems = (prefix: string) => 
        initialProjects.map((p, i) => ({ 
            project: p, 
            uniqueId: `${prefix}-${Date.now()}-${i}` 
        }));

    const handleBottomIntersect = () => {
        const newItems = generateItems('next');
        setItems(prev => [...prev, ...newItems]);
    };

    useEffect(() => {
        const options = { threshold: 0 };
        
        const bottomObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                handleBottomIntersect();
            }
        }, options);

        if (bottomSentinelRef.current) bottomObserver.observe(bottomSentinelRef.current);

        return () => {
            bottomObserver.disconnect();
        };
    }, []);

    return (
        <main className={styles.main}>
            <Hero />
            
            <div className={styles.gridContainer}>
                {items.map((item, index) => (
                    <ProjectCard 
                        key={item.uniqueId} 
                        project={item.project}
                        instanceId={item.uniqueId}
                        // The index here is for Framer Motion delay, so it should be based on the original list length
                        index={index % initialProjects.length} 
                    />
                ))}
            </div>
            
            {/* Bottom Sentinel */}
            <div ref={bottomSentinelRef} style={{ height: '50px', width: '100%', pointerEvents: 'none' }} />
        </main>
    );
}