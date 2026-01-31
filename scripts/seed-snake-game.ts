import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'snake-game';

    const existing = await prisma.miniGame.findUnique({
        where: { slug },
    });

    if (existing) {
        console.log(`Game '${slug}' already exists. Updating...`);
        await prisma.miniGame.update({
            where: { slug },
            data: {
                title: 'Snake Game',
                description: '먹이를 먹고 몸집을 키워보세요! 벽이나 자신의 몸에 부딪히면 안 됩니다. (Arrow Keys / Swipe)',
                isActive: true,
            }
        });
        return;
    }

    const game = await prisma.miniGame.create({
        data: {
            slug,
            title: 'Snake Game',
            description: '먹이를 먹고 몸집을 키워보세요! 벽이나 자신의 몸에 부딪히면 안 됩니다. (Arrow Keys / Swipe)',
            thumbnailUrl: 'https://placehold.co/400x300?text=Snake+Game', // Temporary
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
