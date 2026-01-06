import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { optimizeImage } from '@/lib/image-optimizer';

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const originalFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const isImage = file.type.startsWith('image/');

    let finalBuffer: Buffer = buffer;
    let finalFilename = `${Date.now()}-${originalFilename}`;

    if (isImage) {
        try {
            const optimized = await optimizeImage(buffer, originalFilename);
            finalBuffer = optimized.buffer as Buffer;
            // Ensure unique filename for optimized image too
            finalFilename = `${Date.now()}-${optimized.filename}`;
        } catch (error) {
            console.error('Image optimization failed, falling back to original:', error);
            // Fallback to original buffer and filename if optimization fails
        }
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads');
    const filepath = path.join(uploadDir, finalFilename);

    try {
        await writeFile(filepath, finalBuffer);
        const url = `/uploads/${finalFilename}`;
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
