import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { optimizeImage } from './src/lib/image-optimizer';

const prisma = new PrismaClient();

async function main() {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    const files = await fs.readdir(uploadsDir);

    for (const file of files) {
        // Skip video files
        if (file.match(/\.(mp4|webm|ogg)$/i)) continue;
        
        const filePath = path.join(uploadsDir, file);
        const buffer = await fs.readFile(filePath);

        try {
            console.log(`Optimizing ${file}...`);
            const optimized = await optimizeImage(buffer, file);
            
            const newFilename = optimized.filename;
            const newFilePath = path.join(uploadsDir, newFilename);

            // Save new file
            await fs.writeFile(newFilePath, optimized.buffer);

            // If filename changed (e.g. jpg -> webp), update DB and delete old
            if (newFilename !== file) {
                const oldUrl = `/uploads/${file}`;
                const newUrl = `/uploads/${newFilename}`;

                console.log(`Updating references from ${oldUrl} to ${newUrl}`);

                // Update Projects (coverImage)
                await prisma.project.updateMany({
                    where: { coverImage: oldUrl },
                    data: { coverImage: newUrl }
                });

                // Update Blocks
                const blocks = await prisma.block.findMany({
                    where: { content: oldUrl }
                });
                for (const block of blocks) {
                    await prisma.block.update({
                        where: { id: block.id },
                        data: { content: newUrl }
                    });
                }

                // Update Gallery Images
                await prisma.projectImage.updateMany({
                    where: { url: oldUrl },
                    data: { url: newUrl }
                });
                
                // Update Pages (JSON content)
                const pages = await prisma.page.findMany();
                for (const page of pages) {
                    if (page.content) {
                        let content = JSON.parse(page.content);
                        if (content.heroVideo && content.heroVideo === oldUrl) {
                            content.heroVideo = newUrl;
                            await prisma.page.update({
                                where: { slug: page.slug },
                                data: { content: JSON.stringify(content) }
                            });
                        }
                    }
                }

                // Delete old file
                await fs.unlink(filePath);
            } else {
                console.log(`Overwriting ${file} with optimized version`);
                // Filename same (e.g. transparent PNG, or already WebP)
                // Overwrite with the newly optimized buffer
                await fs.writeFile(filePath, optimized.buffer);
            }

        } catch (error) {
            console.error(`Failed to optimize ${file}:`, error);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });