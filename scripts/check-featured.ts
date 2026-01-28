import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFeaturedQuizzes() {
    const allQuizzes = await prisma.quiz.findMany()

    console.log('\n=== All Quizzes ===')
    allQuizzes.forEach(q => {
        console.log(`ID: ${q.id}`)
        console.log(`Title: ${q.title}`)
        console.log(`isFeatured: ${q.isFeatured}`)
        console.log('---')
    })

    const featuredQuizzes = allQuizzes.filter(q => q.isFeatured)
    console.log(`\nTotal quizzes: ${allQuizzes.length}`)
    console.log(`Featured quizzes: ${featuredQuizzes.length}`)

    if (featuredQuizzes.length > 0) {
        console.log('\n=== Featured Quizzes ===')
        featuredQuizzes.forEach(q => {
            console.log(`- ${q.title}`)
            console.log(`  Image: ${q.imageUrl}`)
        })
    }
}

checkFeaturedQuizzes()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
