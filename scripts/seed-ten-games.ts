import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const games = [
    { slug: 'memory-match', title: 'Memory Match', description: '같은 카드를 찾아 뒤집으세요! (기억력 테스트)' },
    { slug: 'tic-tac-toe', title: 'Tic-Tac-Toe', description: 'X와 O를 3개 일렬로 나열하여 승리하세요!' },
    { slug: 'whack-a-mole', title: 'Whack-A-Mole', description: '튀어오르는 두더지를 빠르게 클릭하세요!' },
    { slug: 'color-match', title: 'Color Match', description: '글자의 색상과 이름이 일치하는지 빠르게 판단하세요!' },
    { slug: 'minesweeper', title: 'Minesweeper', description: '숫자 힌트로 지뢰를 찾아내고 모두 제거하세요!' },
    { slug: 'brick-breaker', title: 'Brick Breaker', description: '공을 튕겨 모든 벽돌을 파괴하세요!' },
    { slug: 'game-tetris', title: 'Tetris', description: '블록을 맞춰 줄을 지우고 점수를 얻으세요!' },
    { slug: 'ping-pong', title: 'Ping Pong', description: '패들을 움직여 공을 상대방 진영으로 넘기세요!' },
    { slug: 'tower-stack', title: 'Tower Stack', description: '블록을 최대한 높이 쌓아 성을 만드세요!' },
    { slug: 'word-scramble', title: 'Word Scramble', description: '뒤섞인 글자를 조합해 올바른 단어를 맞추세요!' },
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
