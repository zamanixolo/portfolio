'use client';

import { useState, useEffect, useRef } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { Block, Project, ProjectImage } from '@prisma/client';
import editorStyles from './Editor.module.css';
import pageStyles from '../app/work/[id]/page.module.css'; // Import page styles for authentic layout
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VideoPreview from './VideoPreview';
import { BsTextParagraph, BsImage, BsCameraVideo } from 'react-icons/bs'; // Import icons

interface Props {
    project: Project & { blocks: Block[], gallery: ProjectImage[] };
}

export default function BlockEditor({ project }: Props) {
    const [blocks, setBlocks] = useState<Block[]>(project.blocks.sort((a, b) => a.order - b.order));
    const [title, setTitle] = useState(project.title);
    const [category, setCategory] = useState(project.category);
    const [date, setDate] = useState(new Date(project.date).toISOString().split('T')[0]);
    const [alignment, setAlignment] = useState(project.layoutAlignment || 'center');
    const [bgColor, setBgColor] = useState(project.backgroundColor || '#ffffff');
    const [textColor, setTextColor] = useState(project.textColor || '#000000');
    const [defaultWidth, setDefaultWidth] = useState('full'); // New state for pre-selected width
    const [isMigrating, setIsMigrating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);
    
    // Media Upload State (Global or per block? We'll stick to immediate upload for simplicity)
    const [coverImage, setCoverImage] = useState(project.coverImage); 
    const [coverVideo, setCoverVideo] = useState(project.coverVideo);
    const [description, setDescription] = useState(project.description); 
    const [gallery, setGallery] = useState(project.gallery);
    const router = useRouter();
    
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setBlocks(project.blocks.sort((a, b) => a.order - b.order));
    }, [project.blocks]);

    async function handleGlobalSave() {
        setIsSaving(true);
        try {
            // Prepare payload
            const payload = {
                title,
                category,
                date: new Date(date),
                description,
                layoutAlignment: alignment,
                coverImage,
                coverVideo,
                backgroundColor: bgColor,
                textColor: textColor,
                
                blocks: blocks.map((b, index) => ({
                    ...b,
                    order: index // Ensure order is explicit based on array position
                }))
            };

            const res = await fetch(`/api/projects/${project.id}/sync`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to save project');
            }
            
            // Reload to get fresh state (and real IDs for new blocks)
            router.refresh();
            // Optional: Show success toast
        } catch (e: any) {
            console.error(e);
            alert(e.message || 'Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    }

    async function deleteGalleryImage(id: string) {
        console.log("Deleting gallery image:", id);
        // if (!confirm("Delete this image from the gallery?")) return;
        
        const previousGallery = [...gallery];
        setGallery(gallery.filter(g => g.id !== id));

        try {
            const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                throw new Error('Failed to delete image');
            }
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to delete image. It might have already been removed.");
            setGallery(previousGallery);
        }
    }

    // Handle Cover Upload (Keep immediate upload for file handling simplicity)
    async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                if (type === 'image') {
                    setCoverImage(data.url);
                } else {
                    setCoverVideo(data.url);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsBulkUploading(true);
        const newBlocks: Block[] = [];

        try {
            const uploadPromises = Array.from(files).map(async (file, i) => {
                const formData = new FormData();
                formData.append('file', file);
                
                try {
                    const res = await fetch('/api/upload', { method: 'POST', body: formData });
                    const data = await res.json();
                    
                    if (data.url) {
                        return {
                            id: `temp-${Date.now()}-${i}`,
                            type,
                            content: data.url,
                            order: blocks.length + i,
                            width: defaultWidth,
                            alignment: 'left',
                            autoplay: false,
                            caption: null,
                            projectId: project.id
                        } as Block;
                    }
                } catch (err) {
                    console.error('Failed to upload file', file.name, err);
                }
                return null;
            });

            const results = await Promise.all(uploadPromises);
            const successfulBlocks = results.filter((b): b is Block => b !== null);
            
            setBlocks(prev => [...prev, ...successfulBlocks]);
        } catch (error) {
            console.error('Bulk upload error:', error);
        } finally {
            setIsBulkUploading(false);
            // Reset input
            if (e.target) e.target.value = '';
        }
    }

    async function migrateGallery() {
        // Migration is a complex action, keep it immediate or disable.
        if (!confirm(`Import ${project.gallery?.length} images? This will reload the page.`)) return;
        setIsMigrating(true);
        await fetch(`/api/projects/${project.id}/migrate-gallery`, { method: 'POST' });
        router.refresh();
        window.location.reload();
    }

    function addBlock(type: 'text' | 'image' | 'video', initialWidth: string = 'full') {
        const newBlock: Block = {
            id: `temp-${Date.now()}`,
            type,
            content: type === 'text' ? 'New text block' : '',
            order: blocks.length,
            width: initialWidth,
            alignment: 'left',
            autoplay: false,
            caption: null,
            projectId: project.id
        };
        setBlocks([...blocks, newBlock]);
    }

    // Only updates local state
    function updateBlock(id: string, data: Partial<Block>) {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...data } : b));
    }

    function deleteBlock(id: string) {
        console.log('Deleting block:', id);
        // if (!confirm('Delete this block?')) return; // Removed confirmation to test responsiveness
        setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== id));
    }

    function duplicateBlock(id: string) {
        setBlocks(prevBlocks => {
            const index = prevBlocks.findIndex(b => b.id === id);
            if (index === -1) return prevBlocks;

            const originalBlock = prevBlocks[index];
            const duplicatedBlock: Block = {
                ...originalBlock,
                id: `temp-${Date.now()}-dup-${Math.random().toString(36).substring(7)}`, // New unique temp ID
                order: originalBlock.order + 0.5, // Temporarily adjust order for sorting
                // If content is an image/video, it will reuse the URL. No new upload.
            };

            const newBlocks = [
                ...prevBlocks.slice(0, index + 1),
                duplicatedBlock,
                ...prevBlocks.slice(index + 1)
            ];

            // Re-sort to ensure order is correct before saving, order field will be re-indexed on save
            return newBlocks.sort((a, b) => a.order - b.order);
        });
    }

    function moveBlock(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
        
        setBlocks(newBlocks);
    }

    function handleReorder(newOrder: Block[]) {
        setBlocks(newOrder);
    }

    return (
        <div className={editorStyles.editorWrapper} style={{ backgroundColor: bgColor, color: textColor, minHeight: '100vh', transition: 'background 0.3s, color 0.3s' }}>
            {/* Floating Toolbar */}
            <div className={editorStyles.toolbar}>
                <div className={editorStyles.toolbarInner}>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        ref={imageInputRef} 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleBulkUpload(e, 'image')}
                    />
                    <input 
                        type="file" 
                        multiple 
                        accept="video/mp4,video/webm" 
                        ref={videoInputRef} 
                        style={{ display: 'none' }} 
                        onChange={(e) => handleBulkUpload(e, 'video')}
                    />

                    <span className={editorStyles.toolbarTitle}>
                        {isBulkUploading ? 'Uploading...' : 'Editor Mode'}
                    </span>
                    <div className={editorStyles.toolbarActions}>
                        <button type="button" className={editorStyles.toolbarBtn} onPointerDown={(e) => { e.stopPropagation(); addBlock('text', defaultWidth); }}>
                            <BsTextParagraph size={18} />
                        </button>
                        <button type="button" className={editorStyles.toolbarBtn} onPointerDown={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}>
                            <BsImage size={18} />
                        </button>
                        <button type="button" className={editorStyles.toolbarBtn} onPointerDown={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}>
                            <BsCameraVideo size={18} />
                        </button>

                        <select 
                            value={defaultWidth} 
                            onChange={(e) => setDefaultWidth(e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()} 
                            style={{ marginLeft: '0.5rem', background: 'black', color: 'white', border: '1px solid #333', padding: '0.25rem', borderRadius: '4px', fontSize: '0.75rem', width: 'auto' }}
                        >
                            <option value="full">Full</option>
                            <option value="half">Half</option>
                            <option value="third">Third</option>
                            <option value="quarter">Quarter</option>
                        </select>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '1rem' }} onPointerDown={(e) => e.stopPropagation()}>
                            <label style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>BG</label>
                            <input 
                                type="color" 
                                value={bgColor} 
                                onChange={(e) => setBgColor(e.target.value)} 
                                style={{ border: 'none', width: '25px', height: '25px', padding: 0, background: 'none', cursor: 'pointer' }}
                                title="Background Color"
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onPointerDown={(e) => e.stopPropagation()}>
                            <label style={{ fontSize: '0.6rem', color: '#888', textTransform: 'uppercase' }}>Txt</label>
                            <input 
                                type="color" 
                                value={textColor} 
                                onChange={(e) => setTextColor(e.target.value)} 
                                style={{ border: 'none', width: '25px', height: '25px', padding: 0, background: 'none', cursor: 'pointer' }}
                                title="Text Color"
                            />
                        </div>

                        <select 
                            value={alignment} 
                            onChange={(e) => setAlignment(e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()} // Stop propagation for select
                            style={{ marginLeft: '1rem', background: 'black', color: 'white', border: '1px solid #333', padding: '0.25rem', borderRadius: '4px', fontSize: '0.75rem' }}
                        >
                            <option value="center">Center</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                        </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                        <button type="button"
                            className={editorStyles.doneBtn} 
                            style={{ background: '#4CAF50', borderColor: '#45a049' }}
                            onClick={handleGlobalSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button"
                            className={editorStyles.doneBtn}
                            style={{ background: 'transparent', color: '#999', border: 'none' }}
                            onClick={() => router.push(`/work/${project.id}`)}
                        >
                            Exit
                        </button>
                    </div>
                </div>
            </div>

            {/* Visual Context (Read Only) */}
            <article className={pageStyles.article}>
                <header className={pageStyles.header}>
                    <div className={pageStyles.meta}>
                        <input
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={pageStyles.category}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid currentColor', color: 'inherit', width: 'auto', textAlign: 'inherit' }}
                            placeholder="Category"
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={pageStyles.date}
                            style={{ background: 'transparent', border: 'none', borderBottom: '1px solid currentColor', color: 'inherit', fontFamily: 'inherit' }}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                    </div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={pageStyles.title}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            borderBottom: '1px dashed currentColor', 
                            color: 'inherit', 
                            width: '100%', 
                            textAlign: 'center',
                            outline: 'none'
                        }}
                        placeholder="Project Title"
                        onPointerDown={(e) => e.stopPropagation()}
                    />
                </header>

                <div className={`${pageStyles.coverImage} ${editorStyles.editableCover}`}>
                    {coverVideo ? (
                        <video
                            src={coverVideo}
                            className={pageStyles.image}
                            autoPlay
                            muted
                            loop
                            playsInline
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        coverImage && (
                            <Image
                                src={coverImage}
                                alt={project.title}
                                fill
                                className={pageStyles.image}
                                priority
                            />
                        )
                    )}
                    
                    <div className={editorStyles.coverEditOverlay}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                            <label className={editorStyles.uploadLabel} style={{ cursor: 'pointer', background: 'white', color: 'black' }} onPointerDown={(e) => e.stopPropagation()}>
                                <input type="file" hidden accept="image/*" onChange={(e) => handleCoverUpload(e, 'image')} />
                                Change Cover Image
                            </label>
                            
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <label className={editorStyles.uploadLabel} style={{ cursor: 'pointer', background: 'white', color: 'black' }} onPointerDown={(e) => e.stopPropagation()}>
                                    <input type="file" hidden accept="video/mp4,video/webm" onChange={(e) => handleCoverUpload(e, 'video')} />
                                    {coverVideo ? 'Change Video' : 'Add Video'}
                                </label>
                                {coverVideo && (
                                    <button type="button"
                                        onPointerDown={(e) => { e.stopPropagation(); setCoverVideo(null); }}
                                        style={{ background: 'red', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Remove Video
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`${pageStyles.content} ${
                    alignment === 'left' ? pageStyles.blockAlignLeft : 
                    alignment === 'right' ? pageStyles.blockAlignRight : 
                    pageStyles.blockAlignCenter
                }`}>
                    <textarea
                        className={pageStyles.description}
                        style={{ 
                            width: '100%', 
                            background: 'transparent', 
                            border: '1px dashed transparent', 
                            resize: 'vertical',
                            minHeight: '100px',
                            textAlign: 'inherit',
                            outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#333'}
                        onBlur={(e) => e.target.style.borderColor = 'transparent'}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onPointerDown={(e) => e.stopPropagation()} // Stop propagation for textarea
                    />
                </div>

                {/* Draggable Blocks Area */}
                <Reorder.Group
                    axis="y"
                    as="div"
                    values={blocks}
                    onReorder={handleReorder}
                    className={`${pageStyles.blocksContainer} ${
                        alignment === 'left' ? pageStyles.blockAlignLeft : 
                        alignment === 'right' ? pageStyles.blockAlignRight : 
                        pageStyles.blockAlignCenter
                    }`}
                    style={{ position: 'relative', minHeight: '200px' }}
                >
                    {blocks.map((block, index) => (
                        <BlockItem
                            key={block.id}
                            index={index}
                            totalBlocks={blocks.length}
                            block={block}
                            updateBlock={updateBlock}
                            deleteBlock={deleteBlock}
                            duplicateBlock={duplicateBlock}
                            moveBlock={moveBlock}
                            styles={pageStyles}
                            editorStyles={editorStyles}
                        />
                    ))}
                </Reorder.Group>

                {/* Gallery Management */}
                {gallery && gallery.length > 0 && (
                    <div style={{ marginTop: '4rem', borderTop: '1px solid #333', paddingTop: '2rem', paddingLeft: '5vw', paddingRight: '5vw' }}>
                        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '1rem', color: '#666' }}>
                            Gallery Images (Not in Blocks)
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                            {gallery.map(img => (
                                <div key={img.id} style={{ position: 'relative' }}>
                                    <div style={{ position: 'relative', width: '100%', height: '150px' }}>
                                        <Image 
                                            src={img.url} 
                                            alt="" 
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                    <button type="button"
                                        onPointerDown={(e) => { e.stopPropagation(); deleteGalleryImage(img.id); }}
                                        style={{ 
                                            position: 'absolute', 
                                            top: 5, 
                                            right: 5, 
                                            background: 'rgba(255, 0, 0, 0.8)', 
                                            color: 'white', 
                                            border: 'none', 
                                            cursor: 'pointer', 
                                            width: '20px', 
                                            height: '20px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            fontSize: '10px'
                                        }}
                                        title="Delete from Gallery"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </div>
    );
}

interface BlockItemProps {
    block: Block;
    index: number;
    totalBlocks: number;
    updateBlock: (id: string, data: Partial<Block>) => void;
    deleteBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;
    moveBlock: (index: number, direction: 'up' | 'down') => void;
    styles: { readonly [key: string]: string };
    editorStyles: { readonly [key: string]: string };
}

function BlockItem({ block, index, totalBlocks, updateBlock, deleteBlock, duplicateBlock, moveBlock, styles, editorStyles }: BlockItemProps) {
    const controls = useDragControls();
    const [isUploading, setIsUploading] = useState(false);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            // Immediate upload to get URL
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                // Update local state with new URL
                updateBlock(block.id, { content: data.url });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    }

    const alignmentClass = block.alignment === 'center' ? styles.blockAlignCenter : 
                           block.alignment === 'right' ? styles.blockAlignRight : 
                           styles.blockAlignLeft;

    const widthClass = block.width === 'half' ? styles.half : 
                       block.width === 'third' ? styles.third : 
                       block.width === 'quarter' ? styles.quarter : 
                       styles.full;

    const cycleWidth = () => {
        const next = block.width === 'full' ? 'half' : 
                     block.width === 'half' ? 'third' : 
                     block.width === 'third' ? 'quarter' : 'full';
        updateBlock(block.id, { width: next });
    };

    return (
        <Reorder.Item
            value={block}
            className={`${styles.block} ${widthClass} ${alignmentClass}`}
            dragListener={false}
            dragControls={controls}
            style={{ position: 'relative' }}
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
                    
                    <div className={editorStyles.controlButtons} style={{ display: 'flex', gap: '2px', marginRight: '5px' }}>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); moveBlock(index, 'up'); }} disabled={index === 0}>↑</button>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); moveBlock(index, 'down'); }} disabled={index === totalBlocks - 1}>↓</button>
                    </div>

                    <div className={editorStyles.controlButtons} style={{ display: 'flex', gap: '2px' }}>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); duplicateBlock(block.id); }}>Dup</button>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); updateBlock(block.id, { alignment: 'left' }); }}>L</button>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); updateBlock(block.id, { alignment: 'center' }); }}>C</button>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); updateBlock(block.id, { alignment: 'right' }); }}>R</button>
                        <div style={{ width: '1px', background: '#333', margin: '0 5px' }}></div>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); cycleWidth(); }} style={{ minWidth: '40px' }}>
                            {block.width ? block.width.charAt(0).toUpperCase() + block.width.slice(1) : 'Full'}
                        </button>
                        <button type="button" onPointerDown={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className={editorStyles.deleteControl}>Remove</button>
                    </div>
                    
                    {/* Media Controls */}
                    {(block.type === 'image' || block.type === 'video') && (
                        <div className={editorStyles.quickInput}>
                            {block.type === 'image' && (
                                <label className={editorStyles.uploadLabel} onPointerDown={(e) => e.stopPropagation()}>
                                    <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    {isUploading ? '...' : 'Upload Image'}
                                </label>
                            )}
                            {block.type === 'video' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }} onPointerDown={(e) => e.stopPropagation()}>
                                    <label className={editorStyles.uploadLabel}>
                                        <input type="file" hidden accept="video/mp4,video/webm,video/ogg" onChange={handleFileUpload} />
                                        {isUploading ? '...' : 'Upload Video'}
                                    </label>
                                    <label style={{ fontSize: '0.6rem', color: '#ccc', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}>
                                        <input type="checkbox" 
                                            checked={block.autoplay || false} 
                                            onChange={(e) => updateBlock(block.id, { autoplay: e.target.checked })} 
                                            onPointerDown={(e) => e.stopPropagation()} // Stop propagation for checkbox
                                        />
                                        Autoplay
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Render */}
                <div className={editorStyles.editableContent}>
                    {block.type === 'text' ? (
                        <textarea
                            className={styles.textBlock}
                            style={{ 
                                width: '100%', 
                                background: 'transparent', 
                                border: '1px dashed #333', 
                                color: 'inherit', 
                                resize: 'vertical', 
                                minHeight: '100px',
                            }}
                            value={block.content}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            onPointerDown={(e) => e.stopPropagation()} // Stop propagation for textarea
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
                                    <div className={styles.imageBlock}>
                                        {(block.content.startsWith('/uploads/') || block.content.match(/\.(mp4|webm|ogg)$/i)) ? (
                                            <VideoPreview 
                                                src={block.content} 
                                                autoplay={block.autoplay || false}
                                                className={styles.nativeVideo}
                                                style={{}}
                                            />
                                        ) : (
                                            <div className={styles.videoEmbed}>
                                                <iframe 
                                                    src={block.content.replace('watch?v=', 'embed/') + (block.autoplay ? '?autoplay=1&mute=1' : '')} 
                                                    className={styles.iframe} 
                                                    allowFullScreen 
                                                    title="Video Player" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className={editorStyles.emptyPlaceholder}>
                                    {block.type} placeholder
                                </div>
                            )}
                            
                            {/* URL Input */}
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }} onPointerDown={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    className={editorStyles.urlInput}
                                    placeholder="Or paste URL..."
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                />
                                {block.content && (
                                    <button type="button"
                                        onPointerDown={(e) => { e.stopPropagation(); updateBlock(block.id, { content: '' }); }}
                                        style={{ 
                                            background: '#333', 
                                            color: '#ccc', 
                                            border: 'none', 
                                            padding: '4px 8px', 
                                            fontSize: '0.7rem', 
                                            cursor: 'pointer',
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title="Clear Media"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Reorder.Item>
    );
}
