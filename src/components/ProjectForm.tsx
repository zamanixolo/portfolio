'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ProjectForm.module.css';

export default function ProjectForm() {
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setUploading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const title = formData.get('title');
            const category = formData.get('category');
            const description = formData.get('description');

            let coverVideo = formData.get('coverVideo') as string;

            // Handle Video Upload
            const coverVideoFile = formData.get('coverVideoFile') as File;
            if (coverVideoFile && coverVideoFile.size > 0) {
                const uploadData = new FormData();
                uploadData.append('file', coverVideoFile);
                const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
                if (!uploadRes.ok) throw new Error('Video upload failed');
                const uploadJson = await uploadRes.json();
                coverVideo = uploadJson.url;
            }

            // Handle File Upload
            const coverFile = formData.get('coverImage') as File;
            let coverUrl = '';

            if (coverFile && coverFile.size > 0) {
                const uploadData = new FormData();
                uploadData.append('file', coverFile);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadData
                });

                if (!uploadRes.ok) throw new Error('Upload failed');
                const uploadJson = await uploadRes.json();
                coverUrl = uploadJson.url;
            }

            // Submit Project
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    category,
                    description,
                    coverImage: coverUrl,
                    coverVideo,
                    gallery: [] // TODO: Enable gallery upload
                })
            });

            if (!res.ok) throw new Error('Project creation failed');

            router.refresh(); // Refresh server components
            router.push('/');

        } catch (error) {
            console.error(error);
            alert('Something went wrong. Check console.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.group}>
                <label className={styles.label} htmlFor="title">Project Title</label>
                <input className={styles.input} type="text" name="title" id="title" required />
            </div>

            <div className={styles.group}>
                <label className={styles.label} htmlFor="category">Category</label>
                <input className={styles.input} type="text" name="category" id="category" placeholder="Identity, Editorial..." required />
            </div>

            <div className={styles.group}>
                <label className={styles.label} htmlFor="description">Description</label>
                <textarea className={styles.textarea} name="description" id="description" />
            </div>

            <div className={styles.group}>
                <label className={styles.label} htmlFor="coverImage">Cover Image</label>
                <input className={styles.input} type="file" name="coverImage" id="coverImage" accept="image/*" />
            </div>

            <div className={styles.group}>
                <label className={styles.label} htmlFor="coverVideo">Cover Video</label>
                <div className={styles.videoInputGroup} style={{ display: 'flex', gap: '10px' }}>
                    <input
                        className={styles.input}
                        type="file"
                        name="coverVideoFile"
                        id="coverVideoFile"
                        accept="video/mp4,video/webm"
                        style={{ flex: 1 }}
                    />
                    <input
                        className={styles.input}
                        type="text"
                        name="coverVideo"
                        id="coverVideo"
                        placeholder="Or Video URL..."
                        style={{ flex: 1 }}
                    />
                </div>
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Upload MP4/WebM or paste a URL</small>
            </div>

            <button className={styles.button} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Create Project'}
            </button>
        </form>
    )
}
