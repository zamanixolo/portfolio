import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inspecting DB...');
    const projects = await prisma.project.findMany({
        include: { gallery: true, blocks: true }
    });

    console.log(`Found ${projects.length} projects.`);
    for (const p of projects) {
        console.log(`Title: "${p.title}"`);
        console.log(`  Cover: ${p.coverImage}`);
        console.log(`  Gallery Count: ${p.gallery.length}`);
        console.log(`  Blocks Count: ${p.blocks.length}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
