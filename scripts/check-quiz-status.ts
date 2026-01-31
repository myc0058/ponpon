
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const quizzes = await prisma.quiz.findMany({
        include: {
            questions: true,
            results: true,
        },
    });

    console.log(`Found ${quizzes.length} quizzes.`);

    for (const quiz of quizzes) {
        const quizImage = !!quiz.imageUrl;
        const questionsReady = quiz.questions.every((q) => !!q.imageUrl);
        const resultsReady = quiz.results.every((r) => !!r.imageUrl);

        console.log(`Quiz: ${quiz.title} (${quiz.id})`);
        console.log(`  Visible: ${quiz.isVisible}`);
        console.log(`  Main Image: ${quizImage}`);
        console.log(`  Questions Ready: ${questionsReady} (${quiz.questions.filter(q => !!q.imageUrl).length}/${quiz.questions.length})`);
        console.log(`  Results Ready: ${resultsReady} (${quiz.results.filter(r => !!r.imageUrl).length}/${quiz.results.length})`);
        console.log('---');
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
