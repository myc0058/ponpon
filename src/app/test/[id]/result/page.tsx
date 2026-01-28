import { prisma } from '@/lib/prisma'
import ResultDisplay from './ResultDisplay'

export default async function ResultPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ score?: string; type?: string }>
}) {
    const { id } = await params
    const { score: scoreParam, type: typeParam } = await searchParams
    const score = parseInt(scoreParam || '0')

    const test = await prisma.test.findUnique({
        where: { id },
        include: {
            results: true
        }
    })

    if (!test) {
        return <div>테스트를 찾을 수 없습니다.</div>
    }

    // Find matching result
    let result = null
    if (test.resultType === 'TYPE_BASED' && typeParam) {
        // Match exact typeCode (e.g. "INTJ") or find partial matches if needed
        // For simplicity, let's look for exact match first
        result = test.results.find(r => r.typeCode === typeParam)
    } else {
        result = test.results.find(
            r => score >= r.minScore && score <= r.maxScore
        )
    }

    // Fallback if no matching result found
    if (!result) {
        result = test.results[0]
    }

    // If still no result (test has no results added), show error
    if (!result) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>결과를 표시할 수 없습니다.</h2>
                <p>관리자가 아직 결과를 등록하지 않았습니다.</p>
            </div>
        )
    }

    // Increment play count
    await prisma.test.update({
        where: { id },
        data: { plays: { increment: 1 } }
    })

    return <ResultDisplay test={test} result={result} score={score} resultType={test.resultType} typeCode={typeParam} />
}
