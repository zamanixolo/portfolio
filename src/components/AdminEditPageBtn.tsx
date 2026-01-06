'use client';

import { useEffect } from 'react';
import { useAdmin } from './AdminProvider';
import Link from 'next/link';

export default function AdminEditPageBtn({ slug }: { slug: string }) {
    const { setCustomAction } = useAdmin();

    useEffect(() => {
        setCustomAction(
            <Link 
                href={`/admin/pages/${slug}`}
                style={{ 
                    color: '#0070f3', 
                    fontWeight: 'bold', 
                    textDecoration: 'none' 
                }}
            >
                Edit Page
            </Link>
        );

        // Cleanup on unmount
        return () => setCustomAction(null);
    }, [slug, setCustomAction]);

    return null; // Logic only component
}
