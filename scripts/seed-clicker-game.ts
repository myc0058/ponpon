import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'clicker-hero';

    const existing = await prisma.miniGame.findUnique({
        where: { slug },
    });

    if (existing) {
        console.log(`Game '${slug}' already exists.`);
        return;
    }

    const game = await prisma.miniGame.create({
        data: {
            slug,
            title: 'Clicker Hero',
            description: 'Click as fast as you can in 10 seconds!',
            thumbnailUrl: 'https://placehold.co/400x300?text=Clicker+Hero',
            isActive: true,
        },
    });

    console.log(`Created game: ${game.title} (${game.slug})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
