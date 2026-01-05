'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Project } from '@prisma/client';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
    project: Project;
    index: number;
    instanceId?: string;
}

export default function ProjectCard({ project, index, instanceId }: ProjectCardProps) {
    const layoutId = instanceId ? `project-image-${project.id}-${instanceId}` : `project-image-${project.id}`;

    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]); // Use percentage for responsiveness

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <Link
                href={`/work/${project.id}?layoutId=${layoutId}`}
                className={styles.card}
            >
                <motion.div 
                    className={styles.imageContainer}
                    layoutId={layoutId}
                    layout
                    transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
                >
                    <motion.div 
                        className={styles.image} 
                        style={{ y }}
                    >
                        {project.coverVideo ? (
                            <video
                                src={project.coverVideo}
                                poster={project.coverImage || undefined}
                                muted
                                loop
                                playsInline
                                autoPlay
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : project.coverImage ? (
                            <Image
                                src={project.coverImage}
                                alt={project.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'cover', objectPosition: 'center' }}
                            />
                        ) : (
                            <div className={styles.placeholder}>No Image</div>
                        )}
                    </motion.div>
                </motion.div>
                <div className={styles.info}>
                    <span className={styles.category}>{project.category}</span>
                    <h3 className={styles.title}>{project.title}</h3>
                </div>
            </Link>
        </motion.div>
    );
}
