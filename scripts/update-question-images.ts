import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const questionImageUrls = [
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-01.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-02.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-03.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-04.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-05.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-06.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-07.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-08.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-09.jpg',
    'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-10.jpg',
]

async function updateQuestionImages() {
    console.log('Updating question images in database...\n')

    // Get the quiz (assuming it's the one we created)
    const quiz = await prisma.quiz.findFirst({
        where: {
            title: '남들이 보는 나 vs 내가 아는 나 [반전 매력 테스트]'
        },
        include: {
            questions: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!quiz) {
        console.error('Quiz not found!')
        return
    }

    console.log(`Found quiz: ${quiz.title}`)
    console.log(`Updating ${quiz.questions.length} questions...\n`)

    for (let i = 0; i < quiz.questions.length; i++) {
        const question = quiz.questions[i]
        const imageUrl = questionImageUrls[i]

        await prisma.question.update({
            where: { id: question.id },
            data: { imageUrl }
        })

        console.log(`✓ Updated Q${i + 1}: ${question.content.substring(0, 30)}...`)
    }

    console.log('\n✓ All question images updated successfully!')
}

updateQuestionImages()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
