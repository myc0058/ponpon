import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateQuizImage() {
    const quiz = await prisma.quiz.findFirst({
        where: {
            title: {
                contains: '남들이 보는 나'
            }
        }
    })

    if (!quiz) {
        console.error('Quiz not found!')
        return
    }

    console.log('Current image URL:', quiz.imageUrl)

    const newImageUrl = 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/quiz-main.jpg'

    await prisma.quiz.update({
        where: { id: quiz.id },
        data: {
            imageUrl: newImageUrl,
            isFeatured: true // Ensure it's featured
        }
    })

    console.log('Updated image URL:', newImageUrl)
    console.log('✓ Quiz updated successfully')
}

updateQuizImage()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
