import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const games = [
    { slug: 'slingshot-attack', title: 'Slingshot Attack', description: '새총으로 목표물을 맞추어 파괴하세요! 물리 기반 아케이드.' },
    { slug: 'jump-jump', title: 'Jump Jump', description: '발판을 딛고 끝없이 높이 위로 올라가세요!' },
    { slug: 'memory-sound', title: 'Memory Sound', description: '소리와 색상의 패턴을 모두 기억해야 하는 진화된 메모리 게임.' },
    { slug: 'maze-escape', title: 'Maze Escape', description: '복잡한 미로 속에서 길을 찾아 탈출하세요!' },
    { slug: 'color-flood', title: 'Color Flood', description: '최소한의 횟수로 보드 전체를 한 가지 색으로 채우세요!' },
    { slug: 'galaxy-defender', title: 'Galaxy Defender', description: '몰려드는 외계 함선으로부터 은하계를 지키는 우주 슈팅.' },
    { slug: 'box-tower', title: 'Box Tower', description: '흔들리는 크레인에서 박스를 정확히 떨어뜨려 탑을 쌓으세요!' },
    { slug: 'fruit-slicer', title: 'Fruit Slicer', description: '날아오는 과일들을 빠르게 베어 넘기세요!' },
    { slug: 'traffic-control', title: 'Traffic Control', description: '사거리의 신호를 조절하여 사고 없이 차량을 통과시키세요!' },
    { slug: 'nonogram-logic', title: 'Nonogram Logic', description: '숫자 힌트를 보고 칸을 채워 숨겨진 그림을 완성하세요!' },
];

async function main() {
    for (const gameData of games) {
        const existing = await prisma.miniGame.findUnique({
            where: { slug: gameData.slug },
        });

        if (existing) {
            console.log(`Game '${gameData.slug}' already exists. Updating...`);
            await prisma.miniGame.update({
                where: { slug: gameData.slug },
                data: {
                    title: gameData.title,
                    description: gameData.description,
                    isActive: true,
                }
            });
        } else {
            await prisma.miniGame.create({
                data: {
                    ...gameData,
                    thumbnailUrl: `https://placehold.co/400x300?text=${gameData.title}`,
                    isActive: true,
                    isFeatured: false,
                },
            });
            console.log(`Created game: ${gameData.title} (${gameData.slug})`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
