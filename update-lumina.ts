import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating Lumina Identity System with video...');

    // Abstract light/gradient video 
    const videoUrl = "https://cdn.pixabay.com/video/2019/04/20/22881-331828551_large.mp4";

    await prisma.project.updateMany({
        where: { title: 'Lumina Identity System' },
        data: { coverVideo: videoUrl }
    });

    console.log('Update complete.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
