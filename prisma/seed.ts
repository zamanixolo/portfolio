import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
    {
        title: "Lumina Identity System",
        category: "Identity",
        description: "A comprehensive brand identity for a new clean energy startup. The design focuses on transparency, light, and motion, utilizing a dynamic gradient system and grotesque typography to convey modernity and approachability.",
        coverImage: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2787&auto=format&fit=crop",
        webLink: "https://example.com/lumina",
        date: new Date("2024-11-15"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", caption: "Brand Guidelines" },
            { url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2787&auto=format&fit=crop", caption: "Stationery Design" },
            { url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop", caption: "Outdoor Advertising" }
        ]
    },
    {
        title: "Vogue Tokyo Edit",
        category: "Editorial",
        description: "Art direction and layout design for a special edition of Vogue Tokyo focusing on neo-futurism in street fashion. The spread features experimental typography and overlapping layers to mimic the chaotic energy of the city.",
        coverImage: "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=2670&auto=format&fit=crop",
        webLink: "https://example.com/vogue",
        date: new Date("2024-10-02"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=2669&auto=format&fit=crop", caption: "Spread Layout 01" },
            { url: "https://images.unsplash.com/photo-1552345388-4344d348a951?q=80&w=2600&auto=format&fit=crop", caption: "Typography Detail" },
            { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2600&auto=format&fit=crop", caption: "Fashion Photography" }
        ]
    },
    {
        title: "Museum of Modern Art App",
        category: "Digital",
        description: "UI/UX design for the MoMA mobile guide. The interface serves as a quiet frame for the artwork, using immense negative space and subtle micro-interactions to guide the visitor without distraction.",
        coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop",
        webLink: "https://example.com/moma",
        date: new Date("2024-09-10"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?q=80&w=2600&auto=format&fit=crop", caption: "Onboarding Screens" },
            { url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=2600&auto=format&fit=crop", caption: "Gallery View" },
            { url: "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=2600&auto=format&fit=crop", caption: "Interactive Map" }
        ]
    },
    {
        title: "Analog Photography Archive",
        category: "Web Design",
        description: "A digital archive for a private collection of rare analog photographs. The site uses horizontal scrolling and raw transitions to evoke the feeling of developing film in a darkroom.",
        coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2800&auto=format&fit=crop",
        webLink: "https://example.com/analog",
        date: new Date("2024-08-22"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=2600&auto=format&fit=crop", caption: "Homepage Hero" },
            { url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2600&auto=format&fit=crop", caption: "Photo Grid" },
            { url: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=2600&auto=format&fit=crop", caption: "Detail View" }
        ]
    },
    {
        title: "Kinetic Type Experiments",
        category: "Motion",
        description: "A series of daily motion graphics experiments exploring the limits of variable fonts and kinetic typography. Created using After Effects and heavy scripting.",
        coverImage: "https://images.unsplash.com/photo-1563206767-5b1d97299337?q=80&w=2787&auto=format&fit=crop",
        coverVideo: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        webLink: null,
        date: new Date("2024-07-30"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2600&auto=format&fit=crop", caption: "Frame 001" },
            { url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2600&auto=format&fit=crop", caption: "Frame 045" },
            { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2600&auto=format&fit=crop", caption: "Frame 089" }
        ]
    },
    {
        title: "Nordic Furniture Catalog",
        category: "Editorial",
        description: "Minimalist layout design for a high-end Danish furniture brand. The grid system is strictly adhered to, creating a sense of calm and order that reflects the product design philosophy.",
        coverImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2670&auto=format&fit=crop",
        webLink: "https://example.com/nordic",
        date: new Date("2024-06-14"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=2600&auto=format&fit=crop", caption: "Cover Design" },
            { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2600&auto=format&fit=crop", caption: "Interior Spread" },
            { url: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=2600&auto=format&fit=crop", caption: "Product Detail" }
        ]
    },
    {
        title: "Sonic Waves Festival",
        category: "Identity",
        description: "Visual identity for an electronic music festival. The logo reacts to sound frequency, generating infinite variations for use across social media, stage visuals, and merchandise.",
        coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2600&auto=format&fit=crop",
        webLink: "https://example.com/sonic",
        date: new Date("2024-05-01"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1557787163-1635e2efb160?q=80&w=2600&auto=format&fit=crop", caption: "Poster Series" },
            { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2600&auto=format&fit=crop", caption: "Stage Visuals" },
            { url: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2600&auto=format&fit=crop", caption: "Merchandise" }
        ]
    },
    {
        title: "Aesop Skincare Campaign",
        category: "Art Direction",
        description: "Global digital campaign for Aesop. We utilized macro photography of organic textures paired with poetic copy to emphasize the raw ingredients of the new product line.",
        coverImage: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=2787&auto=format&fit=crop",
        webLink: "https://example.com/aesop",
        date: new Date("2024-04-12"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=2600&auto=format&fit=crop", caption: "Hero Shot" },
            { url: "https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=2600&auto=format&fit=crop", caption: "Texture Detail" },
            { url: "https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?q=80&w=2600&auto=format&fit=crop", caption: "Lifestyle" }
        ]
    },
    {
        title: "Type Foundry 2025",
        category: "Web Design",
        description: "E-commerce website for an independent type foundry. The type tester is the hero of the site, allowing users to modify weight, slant, and optical sizing in real-time.",
        coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2800&auto=format&fit=crop",
        webLink: "https://example.com/foundry",
        date: new Date("2024-03-28"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2600&auto=format&fit=crop", caption: "Type Tester Interface" },
            { url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2600&auto=format&fit=crop", caption: "Checkout Flow" },
            { url: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=2600&auto=format&fit=crop", caption: "Mobile Layout" }
        ]
    },
    {
        title: "Architecture Digest Annual",
        category: "Editorial",
        description: "Cover and feature spread design for AD's annual 'Innovators' issue. We commissioned 3D artists to reimagine classic architectural landmarks for the cover.",
        coverImage: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2668&auto=format&fit=crop",
        webLink: "https://example.com/ad",
        date: new Date("2024-02-15"),
        gallery: [
            { url: "https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=2600&auto=format&fit=crop", caption: "Cover Art" },
            { url: "https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?q=80&w=2600&auto=format&fit=crop", caption: "Feature Spread" },
            { url: "https://images.unsplash.com/photo-1507090960745-b32f65d3113a?q=80&w=2600&auto=format&fit=crop", caption: "Contributors Page" }
        ]
    }
]

async function main() {
    console.log('Start seeding...')

    await prisma.projectImage.deleteMany()
    await prisma.project.deleteMany()

    for (const project of projects) {
        const { gallery, ...projectData } = project
        const p = await prisma.project.create({
            data: {
                ...projectData,
                gallery: {
                    create: gallery
                }
            }
        })
        console.log(`Created project with id: ${p.id}`)
    }
    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
