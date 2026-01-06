'use client';

import { useEffect } from 'react';
import { useAdmin } from './AdminProvider';
import Link from 'next/link';

export default function AdminEditProjectBtn({ projectId }: { projectId: string }) {
    const { setCustomAction } = useAdmin();

    useEffect(() => {
        setCustomAction(
            <Link 
                href={`/work/${projectId}/edit`}
                style={{ 
                    color: '#0070f3', 
                    fontWeight: 'bold', 
                    textDecoration: 'none' 
                }}
            >
                Edit Project
            </Link>
        );

        // Cleanup on unmount
        return () => setCustomAction(null);
    }, [projectId, setCustomAction]);

    return null;
}
