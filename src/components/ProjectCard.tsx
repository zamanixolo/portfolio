'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Project } from '@prisma/client';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
    project: Project;
    index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                // Autoplay policy might block this if not interacted with, but muted videos usually play fine.
                console.log("Play interrupted", e);
            });
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <Link
                href={`/work/${project.id}`}
                className={styles.card}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className={styles.imageContainer}>
                    {project.coverVideo ? (
                        <video
                            ref={videoRef}
                            src={project.coverVideo}
                            poster={project.coverImage}
                            muted
                            loop
                            playsInline
                            className={styles.image} // Reusing image class for object-fit
                            style={{ objectFit: 'cover' }}
                        />
                    ) : project.coverImage ? (
                        <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            className={styles.image}
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                        />
                    ) : (
                        <div className={styles.placeholder}>No Image</div>
                    )}
                </div>
                <div className={styles.info}>
                    <span className={styles.category}>{project.category}</span>
                    <h3 className={styles.title}>{project.title}</h3>
                </div>
            </Link>
        </motion.div>
    );
}
