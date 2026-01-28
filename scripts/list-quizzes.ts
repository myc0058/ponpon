import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const quizzes = await prisma.quiz.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true }
    })

    console.log('--- Current Quizzes in DB ---')
    if (quizzes.length === 0) {
        console.log('No quizzes found.')
    } else {
        quizzes.forEach(q => {
            console.log(`[${q.id}] ${q.title}`)
        })
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
