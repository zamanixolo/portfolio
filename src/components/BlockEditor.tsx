'use client';

import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Block, Project, ProjectImage } from '@prisma/client';
import editorStyles from './Editor.module.css';
import pageStyles from '../app/work/[id]/page.module.css'; // Import page styles for authentic layout
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Props {
    project: Project & { blocks: Block[], gallery: ProjectImage[] };
}

export default function BlockEditor({ project }: Props) {
    const [blocks, setBlocks] = useState<Block[]>(project.blocks.sort((a, b) => a.order - b.order));
    const [isMigrating, setIsMigrating] = useState(false);
    const router = useRouter();

    async function migrateGallery() {
        if (!confirm(`Import ${project.gallery?.length} images from the legacy gallery to the layout editor?`)) return;
        setIsMigrating(true);
        await fetch(`/api/projects/${project.id}/migrate-gallery`, { method: 'POST' });
        router.refresh();
        window.location.reload();
    }

    async function addBlock(type: 'text' | 'image' | 'video') {
        const res = await fetch(`/api/projects/${project.id}/blocks`, {
            method: 'POST',
            body: JSON.stringify({
                type,
                content: type === 'text' ? 'New text block' : '',
                order: blocks.length,
                width: 'full'
            })
        });
        const newBlock = await res.json();
        setBlocks([...blocks, newBlock]);
    }

    async function updateBlock(id: string, data: Partial<Block>) {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b));
        await fetch(`/api/blocks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async function deleteBlock(id: string) {
        if (!confirm('Delete this block?')) return;
        setBlocks(blocks.filter(b => b.id !== id));
        await fetch(`/api/blocks/${id}`, { method: 'DELETE' });
    }

    async function handleReorder(newOrder: Block[]) {
        setBlocks(newOrder);
        await fetch(`/api/projects/${project.id}/blocks`, {
            method: 'PUT',
            body: JSON.stringify(newOrder.map((b, i) => ({ id: b.id, order: i })))
        });
    }

    return (
        <div className={editorStyles.editorWrapper}>
            {/* Floating Toolbar */}
            <div className={editorStyles.toolbar}>
                <div className={editorStyles.toolbarInner}>
                    <span className={editorStyles.toolbarTitle}>Editor Mode</span>
                    <div className={editorStyles.toolbarActions}>
                        <button className={editorStyles.toolbarBtn} onClick={() => addBlock('text')}>+ Text</button>
                        <button className={editorStyles.toolbarBtn} onClick={() => addBlock('image')}>+ Image</button>
                        <button className={editorStyles.toolbarBtn} onClick={() => addBlock('video')}>+ Video</button>
                        {project.gallery && project.gallery.length > 0 && (
                            <button className={editorStyles.toolbarBtn} style={{ color: '#eb5e28' }} onClick={migrateGallery} disabled={isMigrating}>
                                {isMigrating ? 'Importing...' : `Import ${project.gallery.length} Images`}
                            </button>
                        )}
                    </div>
                    <button className={editorStyles.doneBtn} onClick={() => router.push(`/work/${project.id}`)}>Done Editing</button>
                </div>
            </div>

            {/* Visual Context (Read Only) */}
            <article className={pageStyles.article}>
                <header className={pageStyles.header}>
                    <div className={pageStyles.meta}>
                        <span className={pageStyles.category}>{project.category}</span>
                        <span className={pageStyles.date}>{new Date(project.date).getFullYear()}</span>
                    </div>
                    <h1 className={pageStyles.title}>{project.title}</h1>
                </header>

                {project.coverImage && (
                    <div className={pageStyles.coverImage}>
                        <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            className={pageStyles.image}
                            priority
                        />
                    </div>
                )}

                <div className={pageStyles.content}>
                    <p className={pageStyles.description}>{project.description}</p>
                </div>

                {/* Draggable Blocks Area */}
                <Reorder.Group
                    axis="y"
                    values={blocks}
                    onReorder={handleReorder}
                    className={pageStyles.blocksContainer} // Use actual page layout class
                    style={{ position: 'relative', minHeight: '200px' }}
                >
                    {blocks.map((block) => (
                        <BlockItem
                            key={block.id}
                            block={block}
                            updateBlock={updateBlock}
                            deleteBlock={deleteBlock}
                            styles={pageStyles}
                            editorStyles={editorStyles}
                        />
                    ))}
                </Reorder.Group>
            </article>
        </div>
    );
}

interface BlockItemProps {
    block: Block;
    updateBlock: (id: string, data: Partial<Block>) => Promise<void>;
    deleteBlock: (id: string) => Promise<void>;
    styles: { readonly [key: string]: string };
    editorStyles: { readonly [key: string]: string };
}

function BlockItem({ block, updateBlock, deleteBlock, styles, editorStyles }: BlockItemProps) {
    const controls = useDragControls();
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) updateBlock(block.id, { content: data.url });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <Reorder.Item
            value={block}
            className={`${styles.block} ${block.width === 'half' ? styles.half : styles.full}`}
            dragListener={false}
            dragControls={controls}
            style={{ position: 'relative' }} // ensure positioning context
        >
            <div className={editorStyles.blockOverlay}>
                {/* Edit Controls Overlay */}
                <div className={editorStyles.blockControls}>
                    <div
                        className={editorStyles.dragHandle}
                        onPointerDown={(e) => controls.start(e)}
                        title="Drag"
                    >
                        ⠿
                    </div>
                    <div className={editorStyles.controlButtons}>
                        <button onClick={() => updateBlock(block.id, { width: block.width === 'full' ? 'half' : 'full' })}>
                            {block.width === 'full' ? 'Set Half' : 'Set Full'}
                        </button>
                        <button onClick={() => deleteBlock(block.id)} className={editorStyles.deleteControl}>Remove</button>
                    </div>
                    {/* Simple input for media */}
                    {(block.type === 'image' || block.type === 'video') && (
                        <div className={editorStyles.quickInput}>
                            {block.type === 'image' && (
                                <label className={editorStyles.uploadLabel}>
                                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    {isUploading ? '...' : 'Upload'}
                                </label>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Render (Editable) */}
                <div className={editorStyles.editableContent}>
                    {block.type === 'text' ? (
                        <textarea
                            className={styles.textBlock} // Use page style text class
                            style={{ width: '100%', background: 'transparent', border: '1px dashed #333', color: 'inherit', resize: 'vertical', minHeight: '100px' }}
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        />
                    ) : (
                        <div className={styles.imageBlock}>
                            {block.content ? (
                                block.type === 'image' ? (
                                    <div style={{ position: 'relative', width: '100%', height: 'auto', aspectRatio: '16/9' }}>
                                        <Image
                                            src={block.content}
                                            className={styles.blockImage}
                                            alt="Block content"
                                            fill
                                            unoptimized
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.videoBlock}>
                                        <iframe src={block.content.replace('watch?v=', 'embed/')} className={styles.iframe} allowFullScreen title="Video Player" />
                                    </div>
                                )
                            ) : (
                                <div className={editorStyles.emptyPlaceholder}>
                                    {block.type} placeholder
                                </div>
                            )}
                            {/* URL fallback input */}
                            <input
                                type="text"
                                className={editorStyles.urlInput}
                                placeholder="Or paste URL..."
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Reorder.Item>
    );
}
