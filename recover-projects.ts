import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

async function main() {
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
        console.log('No uploads directory found.');
        return;
    }

    const files = fs.readdirSync(uploadsDir).filter(f => !f.startsWith('.'));
    
    // Parse timestamps
    const fileData = files.map(f => {
        const parts = f.split('-');
        const timestamp = parseInt(parts[0]);
        return {
            filename: f,
            timestamp: isNaN(timestamp) ? 0 : timestamp,
            isCover: f.toLowerCase().includes('cover')
        };
    }).sort((a, b) => a.timestamp - b.timestamp);

    const clusters: typeof fileData[] = [];
    let currentCluster: typeof fileData = [];

    // Group by time gap (e.g. 5 minutes = 300000ms)
    const GAP_THRESHOLD = 300000; 

    for (const file of fileData) {
        if (currentCluster.length === 0) {
            currentCluster.push(file);
        } else {
            const lastFile = currentCluster[currentCluster.length - 1];
            if (file.timestamp - lastFile.timestamp > GAP_THRESHOLD) {
                clusters.push(currentCluster);
                currentCluster = [file];
            } else {
                currentCluster.push(file);
            }
        }
    }
    if (currentCluster.length > 0) clusters.push(currentCluster);

    console.log(`Found ${clusters.length} potential projects.`);

    for (const cluster of clusters) {
        // Find cover
        let cover = cluster.find(f => f.isCover);
        if (!cover && cluster.length > 0) cover = cluster[0];
        
        if (!cover) continue;

        const date = new Date(cover.timestamp);
        const title = `Recovered Project ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        console.log(`Creating project: ${title} with ${cluster.length} images`);

        const project = await prisma.project.create({
            data: {
                title,
                description: "Automatically recovered from uploaded files.",
                category: "Recovered",
                date: date,
                coverImage: `/uploads/${cover.filename}`,
                layoutAlignment: 'center',
                gallery: {
                    create: cluster.filter(f => f !== cover).map(f => ({
                        url: `/uploads/${f.filename}`,
                        caption: f.filename
                    }))
                }
            }
        });

        // Also add blocks for images so they show up in layout
        const blocks = cluster.filter(f => f !== cover).map((f, index) => ({
            type: 'image',
            content: `/uploads/${f.filename}`,
            order: index,
            width: 'full',
            projectId: project.id
        }));

        if (blocks.length > 0) {
            await prisma.block.createMany({ data: blocks });
        }
    }

    console.log('Recovery complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
