'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useRef } from 'react';
import styles from '@/app/work/[id]/page.module.css';

interface ProjectHeroProps {
    project: {
        id: string;
        title: string;
        coverImage: string | null;
        coverVideo: string | null;
    };
}

export default function ProjectHero({ project }: ProjectHeroProps) {
    const searchParams = useSearchParams();
    const layoutId = searchParams.get('layoutId') || `project-image-${project.id}`;
    const ref = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

    return (
        <motion.div 
            ref={ref}
            className={styles.coverImage}
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
                        ref={videoRef}
                        src={project.coverVideo}
                        poster={project.coverImage || undefined}
                        muted
                        loop
                        playsInline
                        autoPlay
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : project.coverImage && (
                    <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        priority
                        sizes="100vw"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                )}
            </motion.div>
        </motion.div>
    );
}
