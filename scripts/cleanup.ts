import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function run() {
    const quizzes = await prisma.quiz.findMany({
        where: { title: { contains: '셜록 홈즈' } },
        orderBy: { createdAt: 'asc' }
    })
    console.log(`Found ${quizzes.length} Sherlock Holmes quizzes.`)
    if (quizzes.length <= 1) {
        console.log('No duplicates to delete.')
    } else {
        const toDelete = quizzes.slice(0, quizzes.length - 1)
        for (const q of toDelete) {
            console.log(`Deleting old quiz: ${q.id} (created at ${q.createdAt})`)
            await prisma.quiz.delete({ where: { id: q.id } })
        }
    }

    // Check missing images
    const latestQuiz = quizzes[quizzes.length - 1];
    if (!latestQuiz) {
        console.log('No quiz found to check.');
        return;
    }

    const fullQuiz = await prisma.quiz.findUnique({
        where: { id: latestQuiz.id },
        include: { questions: true, results: true }
    })

    if (!fullQuiz) {
        console.log('Could not find latest quiz details.');
        return;
    }

    console.log('--- Missing images in questions ---');
    fullQuiz.questions.forEach(q => {
        if (!q.imageUrl) console.log(`Question: ${q.id} - ${q.content.substring(0, 30)}...`);
    })

    console.log('--- Missing images in results ---');
    fullQuiz.results.forEach(r => {
        if (!r.imageUrl) console.log(`Result: ${r.typeCode}`);
    })
    console.log('--- Cleanup / Check complete ---');
}

run().catch(console.error).finally(() => prisma.$disconnect())
