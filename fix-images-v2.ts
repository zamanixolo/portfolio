import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing broken images with hardcoded replacements...');

    // 1. Kinetic Type Experiments Cover -> Replace with Sonic Waves Cover (valid abstract/motion)
    const validMotionUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2600&auto=format&fit=crop";

    await prisma.project.updateMany({
        where: { title: 'Kinetic Type Experiments' },
        data: { coverImage: validMotionUrl }
    });
    console.log('Fixed Kinetic Type Experiments cover.');

    // 2. Vogue Tokyo Edit Block -> Replace broken block with Architecture Digest Cover (editorial)
    const validEditorialUrl = "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop";

    // Find blocks containing the broken ID
    const brokenUrlPart = 'photo-1552345388';
    // We can't use `contains` easily on block content for updateMany in a single valid generic way 
    // without knowing exact structure, but we can find first.

    const vogueProject = await prisma.project.findFirst({
        where: { title: 'Vogue Tokyo Edit' },
        include: { blocks: true }
    });

    if (vogueProject) {
        const brokenBlock = vogueProject.blocks.find(b => b.content.includes(brokenUrlPart));
        if (brokenBlock) {
            await prisma.block.update({
                where: { id: brokenBlock.id },
                data: { content: validEditorialUrl }
            });
            console.log(`Fixed Vogue broken block ${brokenBlock.id}`);
        } else {
            console.log('No broken block found in Vogue project (maybe already fixed?).');
        }
    }

    // 3. Fix Sonic Waves Block
    const sonicProject = await prisma.project.findFirst({
        where: { title: 'Sonic Waves Festival' },
        include: { blocks: true }
    });

    if (sonicProject) {
        // Broken URL part: photo-1533174072545
        const brokenContentPart = 'photo-1533174072545';
        const brokenBlock = sonicProject.blocks.find(b => b.content.includes(brokenContentPart));

        // Use Sonic Waves Cover as fallback (assuming it works, as audit didn't flag it)
        // Cover: photo-1470225620780...
        const validCover = sonicProject.coverImage;

        if (brokenBlock && validCover) {
            await prisma.block.update({
                where: { id: brokenBlock.id },
                data: { content: validCover }
            });
            console.log(`Fixed Sonic Waves broken block ${brokenBlock.id}`);
        } else {
            console.log('Sonic Waves: No broken block found or cover missing.');
        }
    }

    // 4. Fix Aesop Blocks (3 broken)
    const aesopProject = await prisma.project.findFirst({
        where: { title: 'Aesop Skincare Campaign' },
        include: { blocks: true }
    });

    if (aesopProject) {
        const validCover = aesopProject.coverImage;
        const altImage1 = "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2787&auto=format&fit=crop"; // Lumina
        const altImage2 = "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop"; // Nordic

        // We know there are 3 blocks. Let's just update all of them if they look like Unsplash urls (which they do) 
        // to be sure, or specifically find the broken ones. 
        // Logic: Just cycle through valid images for the 3 blocks.
        const validImages = [validCover, altImage1, altImage2];

        for (let i = 0; i < aesopProject.blocks.length; i++) {
            const block = aesopProject.blocks[i];
            // Only update if it's an image block
            if (block.type === 'image') {
                const newContent = validImages[i % validImages.length];
                await prisma.block.update({
                    where: { id: block.id },
                    data: { content: newContent }
                });
                console.log(`Fixed Aesop block ${block.id}`);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
