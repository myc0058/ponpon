import { prisma } from '@/lib/prisma'
import ResultDisplay from './ResultDisplay'
import { Metadata } from 'next'

// Helper function to find matching result
async function getQuizResult(id: string, scoreParam?: string, typeParam?: string) {
    const score = parseInt(scoreParam || '0')

    const quiz = await prisma.quiz.findUnique({
        where: { id },
        include: {
            results: true
        }
    })

    if (!quiz) return { quiz: null, result: null }

    let result = null
    if (quiz.resultType === 'TYPE_BASED' && typeParam) {
        const userCodes = typeParam.split('')
        let maxOverlap = -1

        quiz.results.forEach((r: any) => {
            if (!r.typeCode) return
            const resultCodes = r.typeCode.split('')
            const overlap = userCodes.filter(c => resultCodes.includes(c)).length
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

    if (!result) {
        result = quiz.results[0]
    }

    return { quiz, result }
}

export async function generateMetadata({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ score?: string; type?: string }>
}): Promise<Metadata> {
    const { id } = await params
    const { score, type } = await searchParams
    const { quiz, result } = await getQuizResult(id, score, type)

    if (!quiz || !result) {
        return {
            title: 'Quiz Result',
        }
    }

    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'}/api/og`)
    ogUrl.searchParams.set('title', result.title)
    ogUrl.searchParams.set('description', result.description.slice(0, 100))
    ogUrl.searchParams.set('quizTitle', quiz.title)
    if (result.imageUrl) {
        ogUrl.searchParams.set('imageUrl', result.imageUrl)
    }

    return {
        title: `${result.title} - ${quiz.title}`,
        description: result.description,
        openGraph: {
            title: `${result.title} | ${quiz.title}`,
            description: result.description,
            images: [
                {
                    url: ogUrl.toString(),
                    width: 1200,
                    height: 630,
                    alt: result.title,
                }
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${result.title} | ${quiz.title}`,
            description: result.description,
            images: [ogUrl.toString()],
        },
    }
}

export default async function QuizResultPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ score?: string; type?: string }>
}) {
    const { id } = await params
    const { score: scoreParam, type: typeParam } = await searchParams
    const { quiz, result } = await getQuizResult(id, scoreParam, typeParam)
    const score = parseInt(scoreParam || '0')

    if (!quiz) {
        return <div>퀴즈를 찾을 수 없습니다.</div>
    }

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
