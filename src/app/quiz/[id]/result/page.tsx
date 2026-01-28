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
        // Smart Matching: Find the result that has the most overlapping characters with the user's result
        const userCodes = typeParam.split('')
        let maxOverlap = -1

        quiz.results.forEach((r: any) => {
            if (!r.typeCode) return
            const resultCodes = r.typeCode.split('')
            // Count how many of userCodes are in resultCodes
            const overlap = userCodes.filter(c => resultCodes.includes(c)).length
            // If overlap is higher, or if same overlap but result code length is closer
            if (overlap > maxOverlap) {
                maxOverlap = overlap
                result = r
            }
        })
    } else {
        result = quiz.results.find(
            (r: any) => score >= r.minScore && score <= r.maxScore
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
