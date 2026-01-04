import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function checkUrl(url: string): Promise<boolean> {
    if (!url) return false;

    // Local files
    if (url.startsWith('/')) {
        const publicPath = path.join(process.cwd(), 'public', url);
        return fs.existsSync(publicPath);
    }

    // External URLs
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeoutId);
        return res.ok;
    } catch (e) {
        return false;
    }
}

async function main() {
    console.log('Starting image audit...');

    const projects = await prisma.project.findMany({
        include: {
            gallery: true,
            blocks: true
        }
    });

    let brokenCount = 0;

    for (const project of projects) {
        // Check Cover Image
        if (project.coverImage) {
            const isOk = await checkUrl(project.coverImage);
            if (!isOk) {
                console.log(`[Broken] Project "${project.title}" Cover: ${project.coverImage}`);
                brokenCount++;
            }
        }

        // Check Cover Video
        if (project.coverVideo) {
            const isOk = await checkUrl(project.coverVideo);
            if (!isOk) {
                console.log(`[Broken] Project "${project.title}" Video: ${project.coverVideo}`);
                brokenCount++;
            }
        }

        // Check Gallery
        for (const img of project.gallery) {
            const isOk = await checkUrl(img.url);
            if (!isOk) {
                console.log(`[Broken] Project "${project.title}" Gallery ID ${img.id}: ${img.url}`);
                brokenCount++;
            }
        }

        // Check Blocks
        for (const block of project.blocks) {
            if (block.type === 'image' || block.type === 'video') {
                const isOk = await checkUrl(block.content);
                if (!isOk) {
                    console.log(`[Broken] Project "${project.title}" Block ID ${block.id} (${block.type}): ${block.content}`);
                    brokenCount++;
                }
            }
        }
    }

    console.log(`Audit complete. Found ${brokenCount} broken links.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
