
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const quizzes = await prisma.quiz.findMany({
        include: {
            questions: true,
            results: true,
        },
    });

    console.log(`Checking ${quizzes.length} quizzes...`);

    for (const quiz of quizzes) {
        const quizImage = !!quiz.imageUrl;
        const questionsReady = quiz.questions.every((q) => !!q.imageUrl);
        const resultsReady = quiz.results.every((r) => !!r.imageUrl);

        if (quizImage && questionsReady && resultsReady) {
            if (!quiz.isVisible) {
                console.log(`Updating ${quiz.title} (${quiz.id}) to visible...`);
                await prisma.quiz.update({
                    where: { id: quiz.id },
                    data: { isVisible: true },
                });
                console.log('  Done.');
            } else {
                console.log(`Skipping ${quiz.title} (${quiz.id}) - already visible.`);
            }
        } else {
            console.log(`Skipping ${quiz.title} (${quiz.id}) - images not ready.`);
            if (!quizImage) console.log('  - Main image missing');
            if (!questionsReady) console.log('  - Some questions missing images');
            if (!resultsReady) console.log('  - Some results missing images');
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
