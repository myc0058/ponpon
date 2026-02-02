import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const args = process.argv.slice(2)
    const fileArg = args.find(arg => arg.startsWith('--file='))

    if (!fileArg) {
        console.error('Usage: npx tsx scripts/seed-from-json.ts --file=contents/topic/quiz-data.json')
        process.exit(1)
    }

    const filePath = path.resolve(process.cwd(), fileArg.split('=')[1])
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`)
        process.exit(1)
    }

    const quizData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    console.log(`Seeding quiz: ${quizData.title}...`)

    const quiz = await prisma.quiz.create({
        data: {
            title: quizData.title,
            description: quizData.description,
            imageUrl: quizData.imageUrl,
            isFeatured: quizData.isFeatured || true,
            isHot: true,
            isVisible: true,
            resultType: quizData.resultType || 'TYPE_BASED',
            typeCodeLimit: quizData.typeCodeLimit || 4,
            questions: {
                create: quizData.questions.map((q: any) => ({
                    order: q.order,
                    content: q.text,
                    imageUrl: q.imageUrl,
                    options: {
                        create: q.options.map((opt: any) => ({
                            content: opt.text,
                            resultTypeCode: Object.keys(opt.score)[0], // Simplified score mapping for now
                        }))
                    }
                }))
            },
            results: {
                create: quizData.results.map((r: any) => ({
                    typeCode: r.typeCode,
                    title: r.title,
                    description: r.description,
                    imageUrl: r.imageUrl
                }))
            }
        }
    })

    console.log(`✅ Success! Quiz created with id: ${quiz.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
