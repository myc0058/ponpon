import { prisma } from '@/lib/prisma'
import QuizPlayer from './QuizPlayer'

export default async function QuizPlayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
            questions: {
                include: { options: true },
                orderBy: { order: 'asc' }
            },
            results: {
                orderBy: { minScore: 'asc' }
            }
        }
    })

    if (!quiz) {
        return <div>Quiz not found</div>
    }

    return <QuizPlayer quiz={quiz} />
}
