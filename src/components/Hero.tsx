'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';
import { useAdmin } from '@/components/AdminProvider';
import { useRouter } from 'next/navigation';

export default function Hero() {
    const { isAdmin, setCustomAction } = useAdmin();
    const router = useRouter();
    const [content, setContent] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/pages/home')
            .then(res => res.json())
            .then(data => setContent(data.content))
            .catch(console.error);
    }, []);

    // Register custom action in Admin Toolbar
    useEffect(() => {
        if (!isAdmin) return;

        // Only show if content is loaded
        if (!content) return;

        if (isEditing) {
            setCustomAction(
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="text-white/70 hover:text-white">Cancel</button>
                    <button onClick={handleSave} className="bg-white text-black px-2 py-0.5 rounded text-xs font-bold hover:bg-gray-200">
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
                    Edit Hero
                </button>
            );
        }

        return () => setCustomAction(null);
    }, [isAdmin, isEditing, saving, content, setCustomAction]);

    async function handleSave() {
        setSaving(true);
        try {
            await fetch('/api/pages/home', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            setIsEditing(false);
            router.refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    }

    async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) {
                setContent({ ...content, heroVideo: data.url });
            }
        } catch (error) {
            console.error('Video upload failed', error);
        }
    }

    if (!content) return null;

    return (
        <section className={styles.hero + ' relative group overflow-hidden'}>
            {content.heroVideo && (
                <div className="absolute inset-0 z-0">
                    <video
                        src={content.heroVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover opacity-50"
                        style={{ width: '100%', height: '80vh' }}
                    />
                </div>
            )}
            
            <div className="absolute top-0 bottom-0 left-20 z-10 flex flex-col items-center justify-center w-full h-full">
            <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
                {isEditing ? (
                    <div className="flex flex-col gap-4 mb-4 items-center">
                        <div className="flex flex-col gap-2 w-full max-w-2xl">
                            <input className="bg-transparent border-b border-white/20 outline-none text-5xl md:text-7xl font-serif text-center" value={content.line1} onChange={e => setContent({ ...content, line1: e.target.value })} placeholder="Line 1" />
                            <input className="bg-transparent border-b border-white/20 outline-none text-5xl md:text-7xl font-serif text-center" value={content.line2} onChange={e => setContent({ ...content, line2: e.target.value })} placeholder="Line 2" />
                            <input className="bg-transparent border-b border-white/20 outline-none text-5xl md:text-7xl font-serif text-center" value={content.line3} onChange={e => setContent({ ...content, line3: e.target.value })} placeholder="Line 3" />
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 bg-black/50 p-2 rounded">
                            <span className="text-sm text-white/70">Background Video:</span>
                            <label className="cursor-pointer bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-200">
                                Upload Video
                                <input type="file" accept="video/mp4,video/webm" hidden onChange={handleVideoUpload} />
                            </label>
                            {content.heroVideo && (
                                <button 
                                    onClick={() => setContent({ ...content, heroVideo: null })}
                                    className="text-red-400 text-sm hover:text-red-300 ml-2"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <span className={styles.line}>{content.line1}</span>
                        <span className={styles.line}>{content.line2}</span>
                        <span className={styles.line}>{content.line3}</span>
                    </>
                )}
            </motion.h1>

            <motion.p
                className={styles.subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
            >
                {isEditing ? (
                    <textarea
                        className="w-full bg-transparent border border-white/20 outline-none resize-none h-[100px] text-center p-2"
                        value={content.subtitle}
                        onChange={e => setContent({ ...content, subtitle: e.target.value })}
                        placeholder="Subtitle"
                    />
                ) : (
                    content.subtitle
                )}
            </motion.p>
            </div>
        </section>
    );
}
