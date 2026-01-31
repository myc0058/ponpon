import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const games = [
    { slug: 'speed-typer', title: 'Speed Typer', description: '단어를 빠르게 입력하여 제거하세요! (타이핑 테스트)' },
    { slug: 'simon-says', title: 'Simon Says', description: '빛나는 색상 배턴의 패턴을 기억하고 따라 누르세요!' },
    { slug: 'sudden-attack', title: 'Sudden Attack', description: '나타나는 타겟을 빠르게 클릭하여 명중시키세요!' },
    { slug: 'cube-runner-3d', title: '3D Cube Runner', description: 'Three.js로 구현된 3D 공간의 장애물을 피하며 전진하세요!' },
    { slug: 'math-quickie', title: 'Math Quickie', description: '제한 시간 내에 사칙연산 문제를 최대한 많이 푸세요!' },
    { slug: 'higher-lower', title: 'Higher or Lower', description: '다음 숫자가 이전보다 높을지 낮을지 예측하세요!' },
    { slug: 'card-solitaire', title: 'Card Solitaire', description: '같은 짝의 카드를 연결하여 보드를 비우세요!' },
    { slug: 'connect-four', title: 'Connect Four', description: '칩을 떨어뜨려 가로, 세로, 대각선 4개를 먼저 연결하세요!' },
    { slug: 'piano-tiles', title: 'Piano Tiles', description: '음악에 맞춰 내려오는 검은 건반을 정확히 누르세요!' },
    { slug: 'bubble-shooter', title: 'Bubble Shooter', description: '같은 색상의 버블을 3개 이상 모아 터뜨리세요!' },
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
