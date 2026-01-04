import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking Prisma Page model...');
    try {
        // Test Raw Query
        const pages: any = await prisma.$queryRaw`SELECT * FROM Page`;
        console.log('Raw Pages Count:', pages.length);
        console.log('Raw Query Works!');
    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
