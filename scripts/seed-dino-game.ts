import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'dino-run';

    const existing = await prisma.miniGame.findUnique({
        where: { slug },
    });

    if (existing) {
        console.log(`Game '${slug}' already exists. Updating...`);
        await prisma.miniGame.update({
            where: { slug },
            data: {
                title: 'Dino Run',
                description: '장애물을 피해 더 멀리 달려보세요! (Spacebar/Click to Jump)',
                isActive: true,
            }
        });
        return;
    }

    const game = await prisma.miniGame.create({
        data: {
            slug,
            title: 'Dino Run',
            description: '장애물을 피해 더 멀리 달려보세요! (Spacebar/Click to Jump)',
            thumbnailUrl: 'https://placehold.co/400x300?text=Dino+Run', // Temporary
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
