import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'flappy-bird';

    const existing = await prisma.miniGame.findUnique({
        where: { slug },
    });

    if (existing) {
        console.log(`Game '${slug}' already exists. Updating...`);
        await prisma.miniGame.update({
            where: { slug },
            data: {
                title: 'Flappy Bird',
                description: '파이프 사이를 통과하며 높이 날아보세요! (Click to Fly)',
                isActive: true,
            }
        });
        return;
    }

    const game = await prisma.miniGame.create({
        data: {
            slug,
            title: 'Flappy Bird',
            description: '파이프 사이를 통과하며 높이 날아보세요! (Click to Fly)',
            thumbnailUrl: 'https://placehold.co/400x300?text=Flappy+Bird', // Temporary
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
