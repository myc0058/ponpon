import { prisma } from '@/lib/prisma'
import ResultDisplay from './ResultDisplay'

export default async function QuizResultPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ score?: string; type?: string }>
}) {
    const { id } = await params
    const { score: scoreParam, type: typeParam } = await searchParams
    const score = parseInt(scoreParam || '0')

    const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
            results: true
        }
    })

    if (!quiz) {
        return <div>퀴즈를 찾을 수 없습니다.</div>
    }

    // Find matching result
    let result = null
    if (quiz.resultType === 'TYPE_BASED' && typeParam) {
        // Match exact typeCode (e.g. "INTJ") or find partial matches if needed
        // For simplicity, let's look for exact match first
        result = quiz.results.find(r => r.typeCode === typeParam)
    } else {
        result = quiz.results.find(
            r => score >= r.minScore && score <= r.maxScore
        )
    }

    // Fallback if no matching result found
    if (!result) {
        result = quiz.results[0]
    }

    // If still no result (quiz has no results added), show error
    if (!result) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>결과를 표시할 수 없습니다.</h2>
                <p>관리자가 아직 결과를 등록하지 않았습니다.</p>
            </div>
        )
    }

    // Increment play count
    await prisma.quiz.update({
        where: { id },
        data: { plays: { increment: 1 } }
    })

    return <ResultDisplay quiz={quiz} result={result} score={score} resultType={quiz.resultType} typeCode={typeParam} />
}
