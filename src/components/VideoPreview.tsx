'use client';

import { useEffect, useRef } from 'react';

interface VideoPreviewProps {
    src: string;
    autoplay: boolean;
    className: string;
    style: React.CSSProperties;
}

export default function VideoPreview({ src, autoplay, className, style }: VideoPreviewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!videoRef.current) return;
        
        if (autoplay) {
            videoRef.current.muted = true; // Ensure muted for autoplay
            videoRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
        } else {
            videoRef.current.pause();
        }
    }, [autoplay]);

    return (
        <video
            ref={videoRef}
            src={src}
            controls={!autoplay} // Hide controls if autoplay is true
            playsInline
            muted={autoplay} // Initial state
            loop={autoplay}
            className={className}
            style={style}
        />
    );
}
