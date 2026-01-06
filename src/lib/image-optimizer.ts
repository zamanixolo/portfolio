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

    // Check if PNG has transparency
    const isPng = ext === '.png';
    const hasTransparency = isPng && (metadata.hasAlpha || metadata.channels === 4);

    if (isPng && hasTransparency) {
        // Optimize PNG but keep format and transparency
        const optimizedBuffer = await pipeline
            .png({ 
                quality: 85, 
                compressionLevel: 9, 
                palette: true 
            })
            .toBuffer();
            
        return {
            buffer: optimizedBuffer,
            filename: originalFilename, // Keep original extension
            mimeType: 'image/png'
        };
    }

    // For everything else (JPEG, non-transparent PNG, etc.), convert to WebP
    // WebP offers superior compression with comparable quality
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
