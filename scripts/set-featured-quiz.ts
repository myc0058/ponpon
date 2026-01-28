import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setQuizAsFeatured() {
    console.log('Setting quiz as featured...\n')

    // Get the first quiz (or the "Appearance vs Reality" quiz)
    const quiz = await prisma.quiz.findFirst({
        where: {
            title: {
                contains: '남들이 보는 나'
            }
        }
    })

    if (!quiz) {
        console.log('Quiz not found. Looking for any quiz...')
        const anyQuiz = await prisma.quiz.findFirst()

        if (!anyQuiz) {
            console.error('No quizzes found in database!')
            return
        }

        await prisma.quiz.update({
            where: { id: anyQuiz.id },
            data: { isFeatured: true }
        })

        console.log(`✓ Set quiz "${anyQuiz.title}" as featured`)
    } else {
        await prisma.quiz.update({
            where: { id: quiz.id },
            data: { isFeatured: true }
        })

        console.log(`✓ Set quiz "${quiz.title}" as featured`)
    }

    // List all featured quizzes
    const featuredQuizzes = await prisma.quiz.findMany({
        where: { isFeatured: true }
    })

    console.log(`\nTotal featured quizzes: ${featuredQuizzes.length}`)
    featuredQuizzes.forEach(q => {
        console.log(`- ${q.title}`)
    })
}

setQuizAsFeatured()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
