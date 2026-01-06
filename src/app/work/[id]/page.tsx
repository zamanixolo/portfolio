import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ProjectCard from '@/components/ProjectCard';
import ProjectHero from '@/components/ProjectHero';
import AdminEditProjectBtn from '@/components/AdminEditProjectBtn';

import styles from './page.module.css';
import { Block, ProjectImage, Project } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
    const { id } = await params;

    const project = await prisma.project.findUnique({
        where: { id },
        include: { gallery: true, blocks: true }
    });

    if (!project) notFound();

    const similarProjects = await prisma.project.findMany({
        where: {
            category: project.category,
            id: { not: id }
        },
        take: 2,
        orderBy: [
            { order: 'asc' },
            { date: 'desc' }
        ]
    });

    const excludedIds = [id, ...similarProjects.map(p => p.id)];
    
    // SQLite doesn't support RAND() in the standard way for Prisma easily without raw query,
    // so we'll fetch a slightly larger set and shuffle in JS, or just fetch remaining and shuffle.
    // For a small portfolio, fetching all excluding current is fine.
    const allOtherProjects = await prisma.project.findMany({
        where: {
            id: { notIn: excludedIds }
        }
    });

    // Shuffle and take 2
    const moreProjects = allOtherProjects
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    // Filter out gallery images that are already present in blocks
    const blockImageUrls = new Set(project.blocks.filter(b => b.type === 'image').map(b => b.content));
    const uniqueGallery = project.gallery.filter(img => !blockImageUrls.has(img.url));

    return (
        <>
            <AdminEditProjectBtn projectId={project.id} />
            <header className={styles.header}>
                <div className={styles.meta}>
                    <span className={styles.category}>{project.category}</span>
                    <span className={styles.date}>{new Date(project.date).getFullYear()}</span>
                </div>
                <h1 className={styles.title}>{project.title}</h1>
            </header>
            {(project.coverImage || project.coverVideo) && <ProjectHero project={project} />}
            <article 
                className={styles.article}
                style={{ 
                    backgroundColor: project.backgroundColor || undefined, 
                    color: project.textColor || undefined,
                    minHeight: '100vh',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                }}
            >

                <div className={`${styles.content} ${
                    project.layoutAlignment === 'left' ? styles.blockAlignLeft : 
                    project.layoutAlignment === 'right' ? styles.blockAlignRight : 
                    styles.blockAlignCenter
                }`}>
                    <p className={styles.description}>{project.description}</p>

                    {project.webLink && (
                        <a href={project.webLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            Visit Live Site ↗
                        </a>
                    )}
                </div>

                {project.blocks.length > 0 && (
                    <div className={`${styles.blocksContainer} ${
                        project.layoutAlignment === 'left' ? styles.alignLeft : 
                        project.layoutAlignment === 'right' ? styles.alignRight : 
                        styles.alignCenter
                    }`}>
                        {project.blocks.sort((a: Block, b: Block) => a.order - b.order).map((block: Block) => (
                            <div
                                key={block.id}
                                className={`${styles.block} ${
                                    block.width === 'half' ? styles.half : 
                                    block.width === 'third' ? styles.third : 
                                    block.width === 'quarter' ? styles.quarter : 
                                    styles.full
                                } ${
                                    block.alignment === 'center' ? styles.blockAlignCenter : 
                                    block.alignment === 'right' ? styles.blockAlignRight : 
                                    styles.blockAlignLeft
                                }`}
                            >
                                {block.type === 'text' && block.content && <div className={styles.textBlock}>{block.content}</div>}
                                {block.type === 'image' && block.content && (
                                    <div className={styles.imageBlock}>
                                        <Image
                                            src={block.content}
                                            alt="Project image"
                                            width={1200}
                                            height={800}
                                            className={styles.blockImage}
                                        />
                                    </div>
                                )}
                                {block.type === 'video' && block.content && (
                                    <div className={styles.imageBlock}>
                                        {(block.content.startsWith('/uploads/') || block.content.match(/\.(mp4|webm|ogg)$/i)) ? (
                                            <video 
                                                src={block.content} 
                                                controls={!block.autoplay}
                                                autoPlay={block.autoplay}
                                                muted={block.autoplay}
                                                loop={block.autoplay}
                                                playsInline
                                                className={styles.nativeVideo}
                                            />
                                        ) : (
                                            <div className={styles.videoEmbed}>
                                                <iframe
                                                    src={block.content.replace('watch?v=', 'embed/') + (block.autoplay ? '?autoplay=1&mute=1' : '')}
                                                    className={styles.iframe}
                                                    allowFullScreen
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {uniqueGallery.length > 0 && (
                    <div className={styles.gallery}>
                        {uniqueGallery.map((img: ProjectImage) => (
                            <div key={img.id} className={styles.galleryItem}>
                                <Image
                                    src={img.url}
                                    alt={img.caption || ''}
                                    width={1600}
                                    height={1200}
                                    className={styles.galleryImage}
                                    sizes="100vw"
                                />
                                {img.caption && <p className="mt-2 text-sm text-gray-500">{img.caption}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </article>

            {similarProjects.length > 0 && (
                <section className={styles.similarSection}>
                    <h2 className={styles.similarTitle}>Similar Projects</h2>
                    <div className={styles.gridContainer}>
                        {similarProjects.map((project: Project, index: number) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                </section>
            )}

            {moreProjects.length > 0 && (
                <section className={styles.similarSection}>
                    <h2 className={styles.similarTitle}>More Projects</h2>
                    <div className={styles.gridContainer}>
                        {moreProjects.map((project: Project, index: number) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
