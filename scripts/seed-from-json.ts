
import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Command line argument processing
const args = process.argv.slice(2)
const fileArg = args.find(arg => arg.startsWith('--file='))

if (!fileArg) {
    console.error('Usage: npx tsx scripts/seed-from-json.ts --file=path/to/quiz.json')
    process.exit(1)
}

const filePath = fileArg.split('=')[1]

async function main() {
    console.log(`Reading quiz data from ${filePath}...`)

    const absolutePath = path.resolve(process.cwd(), filePath)
    const fileContent = readFileSync(absolutePath, 'utf-8')
    const data = JSON.parse(fileContent)

    console.log(`Seeding quiz: ${data.title}`)

    // Check if quiz already exists
    const existingQuiz = await prisma.quiz.findFirst({
        where: { title: data.title }
    })

    const quizData = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        resultType: data.resultType,
        typeCodeLimit: data.typeCodeLimit,
        questions: {
            create: data.questions.map((q: any) => ({
                order: q.order,
                content: q.content,
                imageUrl: q.imageUrl,
                options: {
                    create: (q.options || []).map((o: any) => ({
                        content: o.content,
                        score: o.score || 0,
                        resultTypeCode: o.resultTypeCode
                    }))
                }
            }))
        },
        results: {
            create: (data.results || []).map((r: any) => ({
                typeCode: r.typeCode,
                title: r.title,
                description: r.description,
                imageUrl: r.imageUrl,
                minScore: r.minScore || 0,
                maxScore: r.maxScore || 0,
                isPremium: r.isPremium || false
            }))
        }
    }

    let quiz;
    if (existingQuiz) {
        console.log(`Updating existing quiz: ${existingQuiz.id}`)
        quiz = await prisma.quiz.update({
            where: { id: existingQuiz.id },
            data: {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                resultType: data.resultType,
                typeCodeLimit: data.typeCodeLimit,
                questions: {
                    deleteMany: {},
                    create: quizData.questions.create
                },
                results: {
                    deleteMany: {},
                    create: quizData.results.create
                }
            }
        })
    } else {
        console.log('Creating new quiz...')
        quiz = await prisma.quiz.create({
            data: quizData
        })
    }

    console.log(`✅ Quiz handled successfully! ID: ${quiz.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
