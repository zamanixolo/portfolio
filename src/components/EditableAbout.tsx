'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '@/app/about/page.module.css';

interface AboutContent {
    intro: string;
    bio1: string;
    bio2: string;
    experience: string[];
    imageUrl?: string;
}

import { useAdmin } from '@/components/AdminProvider';

export default function EditableAbout({ initialContent }: { initialContent: AboutContent }) {
    const { isAdmin, setCustomAction } = useAdmin();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<AboutContent>(initialContent);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Sync state if initialContent changes (e.g. after save & refresh)
    // useEffect(() => { setContent(initialContent); }, [initialContent]);

    // Register custom action in Admin Toolbar
    useEffect(() => {
        if (!isAdmin) return;

        if (isEditing) {
            setCustomAction(
                <div className="flex gap-2">
                    <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-white text-black px-2 py-0.5 rounded text-xs font-bold hover:bg-gray-200"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            );
        } else {
            setCustomAction(
                <button
                    onClick={() => setIsEditing(true)}
                    className="text-white hover:text-white/80 underline"
                >
                    Edit Page
                </button>
            );
        }

        // Cleanup on unmount
        return () => setCustomAction(null);
    }, [isAdmin, isEditing, saving, content, setCustomAction]); // Dep array ensures updates (e.g. saving state) reflect in toolbar

    async function handleSave() {
        setSaving(true);
        try {
            const res = await fetch('/api/pages/about', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (!res.ok) throw new Error('Failed to save');

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save changes');
        } finally {
            setSaving(false);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            setContent(prev => ({ ...prev, imageUrl: data.url }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    }

    function handleCancel() {
        setContent(initialContent);
        setIsEditing(false);
    }

    return (
        <div className="container relative">
            {/* Local Edit Controls Removed - Moved to Global Toolbar */}

            <section className={styles.section}>
                {isEditing ? (
                    <textarea
                        className={`${styles.intro} w-full bg-transparent border-b border-white/20 outline-none resize-none`}
                        value={content.intro}
                        onChange={(e) => setContent({ ...content, intro: e.target.value })}
                        style={{ minHeight: '120px' }}
                    />
                ) : (
                    <h1 className={styles.intro}>
                        {content.intro}
                    </h1>
                )}

                <div className={styles.grid}>
                    <div>
                        {isEditing ? (
                            <div className="flex flex-col gap-4 mb-8">
                                <textarea
                                    className={`${styles.bodyText} w-full bg-transparent border-b border-white/20 outline-none resize-none`}
                                    value={content.bio1}
                                    onChange={(e) => setContent({ ...content, bio1: e.target.value })}
                                    style={{ minHeight: '100px' }}
                                />
                                <textarea
                                    className={`${styles.bodyText} w-full bg-transparent border-b border-white/20 outline-none resize-none`}
                                    value={content.bio2}
                                    onChange={(e) => setContent({ ...content, bio2: e.target.value })}
                                    style={{ minHeight: '100px' }}
                                />
                            </div>
                        ) : (
                            <>
                                <p className={styles.bodyText}>{content.bio1}</p>
                                <p className={styles.bodyText}>{content.bio2}</p>
                            </>
                        )}

                        <div style={{ marginTop: '32px' }}>
                            <h3>Experience</h3>
                            {isEditing ? (
                                <div style={{ marginTop: '16px' }}>
                                    <textarea
                                        className="w-full bg-transparent border border-white/20 p-2 outline-none text-sm text-[var(--muted)]"
                                        value={content.experience.join('\n')}
                                        onChange={(e) => setContent({ ...content, experience: e.target.value.split('\n') })}
                                        style={{ minHeight: '150px', lineHeight: '1.6' }}
                                    />
                                    <p className="text-xs text-[var(--muted)] mt-1">One item per line</p>
                                </div>
                            ) : (
                                <ul style={{ listStyle: 'none', marginTop: '16px', color: 'var(--muted)' }}>
                                    {content.experience.map((exp, i) => (
                                        <li key={i} style={{ marginBottom: '8px' }}>{exp}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className={styles.imagePlaceholder}>
                        {content.imageUrl ? (
                            <div className="relative group">
                                <img src={content.imageUrl} alt="Profile" className="w-full h-auto rounded-lg" />
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="cursor-pointer bg-white text-black px-4 py-2 rounded font-medium hover:bg-gray-200">
                                            Change Image
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                )}
                            </div>
                        ) : (
                            isEditing ? (
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 flex items-center justify-center text-center">
                                    <label className="cursor-pointer">
                                        <span className="text-white/50 block mb-2">{uploading ? 'Uploading...' : 'Upload Profile Image'}</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            ) : (
                                <div className="text-white/20">[No Image Selected]</div>
                            )
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
