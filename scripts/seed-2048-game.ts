import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const slug = 'game-2048';

    const existing = await prisma.miniGame.findUnique({
        where: { slug },
    });

    if (existing) {
        console.log(`Game '${slug}' already exists. Updating...`);
        await prisma.miniGame.update({
            where: { slug },
            data: {
                title: '2048',
                description: '같은 숫자를 합쳐 최고의 기록을 세워보세요! (Arrow Keys / Swipe)',
                isActive: true,
            }
        });
        return;
    }

    const game = await prisma.miniGame.create({
        data: {
            slug,
            title: '2048',
            description: '같은 숫자를 합쳐 최고의 기록을 세워보세요! (Arrow Keys / Swipe)',
            thumbnailUrl: 'https://placehold.co/400x300?text=2048', // Temporary
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
