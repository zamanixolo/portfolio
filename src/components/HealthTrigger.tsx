'use client';

import { useEffect } from 'react';

export default function HealthTrigger() {
    useEffect(() => {
        // Only verify in development and ignore the monitor bot
        if (
            process.env.NODE_ENV === 'development' && 
            !navigator.userAgent.includes('Portfolio-Monitor-Bot')
        ) {
            // Notify the local monitor script that the page has loaded
            fetch('http://localhost:3001/notify').catch(() => {
                // If monitor isn't running, ignore
            });
        }
    }, []);

    return null;
}
