import { prisma } from './src/lib/db';

async function main() {
    try {
        const count = await prisma.project.count();
        console.log('Project count:', count);
        const projects = await prisma.project.findMany();
        console.log('Projects:', projects);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
