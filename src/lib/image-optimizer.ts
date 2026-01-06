import sharp from 'sharp';
import path from 'path';

interface OptimizedImage {
    buffer: Buffer;
    filename: string;
    mimeType: string;
}

export async function optimizeImage(buffer: Buffer, originalFilename: string): Promise<OptimizedImage> {
    const ext = path.extname(originalFilename).toLowerCase();
    const name = path.basename(originalFilename, ext);
    
    let pipeline = sharp(buffer);
    const metadata = await pipeline.metadata();

    // Resize image if wider than 1920px
    if (metadata.width && metadata.width > 1920) {
        pipeline = pipeline.resize({ width: 1920, withoutEnlargement: true });
    }

    // Check if image has transparency
    const hasTransparency = metadata.hasAlpha || metadata.channels === 4;

    if (hasTransparency) {
        // Convert to WebP lossless for transparent images
        const optimizedBuffer = await pipeline
            .webp({ 
                quality: 100, // Lossless compression
                lossless: true,
                effort: 6
            })
            .toBuffer();
            
        return {
            buffer: optimizedBuffer,
            filename: `${name}.webp`, // Use webp extension
            mimeType: 'image/webp'
        };
    } else {
        // For opaque images, convert to WebP lossy
        const optimizedBuffer = await pipeline
            .webp({ 
                quality: 80, 
                effort: 6 // Higher effort = better compression, slower processing
            })
            .toBuffer();

        return {
            buffer: optimizedBuffer,
            filename: `${name}.webp`,
            mimeType: 'image/webp'
        };
    }
}
