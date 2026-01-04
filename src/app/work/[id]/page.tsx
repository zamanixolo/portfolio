import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';

import styles from './page.module.css';
import { Block, ProjectImage } from '@prisma/client';

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

    return (
        <article className={styles.article}>
            <header className={styles.header}>
                <div className={styles.meta}>
                    <span className={styles.category}>{project.category}</span>
                    <span className={styles.date}>{new Date(project.date).getFullYear()}</span>
                </div>
                <h1 className={styles.title}>{project.title}</h1>
            </header>

            {project.coverImage && (
                <div className={styles.coverImage}>
                    <Image
                        src={project.coverImage}
                        alt={project.title}
                        fill
                        className={styles.image}
                        priority
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                </div>
            )}

            <div className={styles.content}>
                <p className={styles.description}>{project.description}</p>

                {project.webLink && (
                    <a href={project.webLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                        Visit Live Site ↗
                    </a>
                )}
            </div>

            {project.blocks.length > 0 && (
                <div className={styles.blocksContainer}>
                    {project.blocks.sort((a: Block, b: Block) => a.order - b.order).map((block: Block) => (
                        <div
                            key={block.id}
                            className={`${styles.block} ${block.width === 'half' ? styles.half : styles.full}`}
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
                                <div className={styles.videoBlock}>
                                    {/* Simple embed detection or raw fallback */}
                                    <iframe
                                        src={block.content.replace('watch?v=', 'embed/')}
                                        className={styles.iframe}
                                        allowFullScreen
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.gallery}>
                {project.gallery.map((img: ProjectImage) => (
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
        </article>
    );
}
