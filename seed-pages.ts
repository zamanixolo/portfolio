import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding pages...');

    // Home Page
    await prisma.page.upsert({
        where: { slug: 'home' },
        update: {},
        create: {
            slug: 'home',
            title: 'Home',
            content: JSON.stringify({
                line1: 'Crafting',
                line2: 'Identity &',
                line3: 'Experience',
                subtitle: 'Senior Multidisciplinary Designer specializing in Identity, Editorial, and Digital Experiences.'
            })
        }
    });

    // About Page
    await prisma.page.upsert({
        where: { slug: 'about' },
        update: {},
        create: {
            slug: 'about',
            title: 'About',
            content: JSON.stringify({
                intro: 'Creating digital experiences with focus, precision, and purpose.',
                bio1: 'I am a multidisciplinary designer based in New York, specializing in brand identity and digital product design. My work strives to find the perfect balance between aesthetics and utility, removing the unnecessary to focus on what matters.',
                bio2: 'With a background in both graphic design and computer science, I bridge the gap between visual storytelling and technical implementation. I believe that good design is honest, long-lasting, and thorough down to the last detail.',
                experience: [
                    'Senior Designer @ Studio (2020—Present)',
                    'Art Director @ Agency (2017—2020)',
                    'Freelance (2015—2017)'
                ]
            })
        }
    });

    console.log('Pages seeded.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
