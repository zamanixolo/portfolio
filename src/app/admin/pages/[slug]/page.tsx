'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react'; // React 19 hook for unwrapping params

export default function PageEditor({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`/api/pages/${slug}`)
            .then(res => res.json())
            .then(data => {
                setContent(data.content);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [slug]);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/pages/${slug}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });
            if (!res.ok) throw new Error('Failed to save');
            alert('Saved successfully');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Error saving');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', textTransform: 'capitalize' }}>Edit {slug} Page</h1>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {slug === 'home' && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Headline Line 1</label>
                            <input
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff' }}
                                value={content.line1 || ''}
                                onChange={e => setContent({ ...content, line1: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Headline Line 2</label>
                            <input
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff' }}
                                value={content.line2 || ''}
                                onChange={e => setContent({ ...content, line2: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Headline Line 3</label>
                            <input
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff' }}
                                value={content.line3 || ''}
                                onChange={e => setContent({ ...content, line3: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Subtitle</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff', minHeight: '100px' }}
                                value={content.subtitle || ''}
                                onChange={e => setContent({ ...content, subtitle: e.target.value })}
                            />
                        </div>
                    </>
                )}

                {slug === 'about' && (
                    <>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Intro Headline</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff', minHeight: '80px' }}
                                value={content.intro || ''}
                                onChange={e => setContent({ ...content, intro: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Bio Paragraph 1</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff', minHeight: '120px' }}
                                value={content.bio1 || ''}
                                onChange={e => setContent({ ...content, bio1: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Bio Paragraph 2</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff', minHeight: '120px' }}
                                value={content.bio2 || ''}
                                onChange={e => setContent({ ...content, bio2: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Experience (One per line)</label>
                            <textarea
                                style={{ width: '100%', padding: '10px', background: '#333', border: 'none', color: '#fff', minHeight: '150px' }}
                                value={content.experience?.join('\n') || ''}
                                onChange={e => setContent({ ...content, experience: e.target.value.split('\n') })}
                            />
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    style={{ padding: '12px 24px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', fontWeight: 'bold' }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
