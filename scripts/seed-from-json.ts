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

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    console.log(`Seeding RPG/Branching quiz: ${data.title}...`)

    // 1. Create Quiz
    const quiz = await prisma.quiz.create({
        data: {
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            isFeatured: data.isFeatured ?? true,
            isHot: true,
            isVisible: true,
            resultType: data.resultType || 'BRANCHING',
            typeCodeLimit: data.typeCodeLimit || 4,
            initialState: data.initialState || null,
        }
    })

    // 2. Create Results and build map
    const resultIdMap: Record<string, string> = {}
    for (const r of data.results) {
        const createdResult = await prisma.result.create({
            data: {
                quizId: quiz.id,
                typeCode: r.typeCode,
                title: r.title,
                description: r.description,
                imageUrl: r.imageUrl,
                minScore: r.minScore || 0,
                maxScore: r.maxScore || 0,
            }
        })
        resultIdMap[r.typeCode] = createdResult.id
    }

    // 3. Create Questions and build map
    const questionIdMap: Record<string, string> = {}
    for (const q of data.questions) {
        const createdQuestion = await prisma.question.create({
            data: {
                quizId: quiz.id,
                content: q.text,
                imageUrl: q.imageUrl,
                order: q.order,
            }
        })
        if (q.id) {
            questionIdMap[q.id] = createdQuestion.id
        }
    }

    // 4. Create Options with linked IDs
    for (const q of data.questions) {
        const dbQuestionId = questionIdMap[q.id]
        if (!dbQuestionId) continue

        for (const opt of q.options) {
            await prisma.option.create({
                data: {
                    questionId: dbQuestionId,
                    content: opt.text,
                    score: opt.score ? (Object.values(opt.score)[0] as number) : 0,
                    resultTypeCode: opt.score ? Object.keys(opt.score)[0] : null,
                    nextQuestionId: opt.nextQuestionId ? questionIdMap[opt.nextQuestionId] : null,
                    targetResultId: opt.targetResultId ? resultIdMap[opt.targetResultId] : null,
                    stateChanges: opt.stateChanges || null,
                    conditions: opt.conditions ? (opt.conditions as any).map((c: any) => ({
                        ...c,
                        nextQuestionId: c.nextQuestionId ? questionIdMap[c.nextQuestionId] : null,
                        targetResultId: c.targetResultId ? resultIdMap[c.targetResultId] : null,
                    })) : null
                }
            })
        }
    }

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
