import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.project.create({
        data: {
            title: 'Neon Nights',
            category: 'Experimental',
            description: 'An exploration of light and motion in urban environments.',
            coverImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop', // Fallback
            coverVideo: 'https://cdn.coverr.co/videos/coverr-walking-in-a-fashion-show-2432/1080p.mp4',
            date: new Date(),
        },
    });

    await prisma.project.create({
        data: {
            title: 'Urban Flow',
            category: 'Documentary',
            description: 'Capturing the rhythm of city life.',
            coverImage: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop', // Fallback
            coverVideo: 'https://cdn.coverr.co/videos/coverr-abstract-colorful-ink-in-water-5282/1080p.mp4',
            date: new Date(),
        },
    });

    console.log('Video projects seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
