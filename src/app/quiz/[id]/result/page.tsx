import { prisma } from '@/lib/prisma'
import ResultDisplay from './ResultDisplay'
import { Metadata } from 'next'
import { compressData, decompressData } from '@/lib/compression'

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
    searchParams: Promise<{ score?: string; type?: string; o?: string }>
}): Promise<Metadata> {
    const { id } = await params
    const { score, type, o } = await searchParams

    let quiz = null
    let result = null

    // 1. 압축된 데이터(o)가 있으면 우선 사용 (Stateless)
    if (o) {
        const decoded = decompressData(o);
        if (decoded) {
            quiz = { id, title: decoded.q || 'Quiz' };
            result = {
                title: decoded.t,
                description: decoded.d,
                imageUrl: decoded.i
            };
        }
    }

    // 2. 없으면 DB에서 조회
    if (!quiz || !result) {
        const data = await getQuizResult(id, score, type)
        quiz = data.quiz
        result = data.result
    }

    if (!quiz || !result) {
        return {
            title: 'Quiz Result',
        }
    }

    const ogUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'}/api/og`)

    // 데이터를 압축해서 'o' 파라미터로 전달 (DB 저장 없이 파라미터로만 전달)
    const encodedData = o || compressData({
        t: result.title,
        d: result.description,
        q: quiz.title,
        i: result.imageUrl
    });

    ogUrl.searchParams.set('o', encodedData)

    if (result.imageUrl) {
        ogUrl.searchParams.set('layoutType', 'result')
    }

    // Cache busting
    ogUrl.searchParams.set('v', '5')

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
    searchParams: Promise<{ score?: string; type?: string; o?: string }>
}) {
    const { id } = await params
    const { score: scoreParam, type: typeParam, o: compressedData } = await searchParams

    let quiz = null
    let result = null
    let score = parseInt(scoreParam || '0')

    // 1. 압축된 데이터(o)가 있으면 우선 사용
    if (compressedData) {
        const decoded = decompressData(compressedData);
        if (decoded) {
            quiz = await prisma.quiz.findUnique({ where: { id } });
            result = {
                id: 'custom',
                quizId: id,
                title: decoded.t,
                description: decoded.d,
                imageUrl: decoded.i,
                isPremium: false
            };
        }
    }

    // 2. 없으면 DB 조회
    if (!quiz || !result) {
        const data = await getQuizResult(id, scoreParam, typeParam)
        quiz = data.quiz
        result = data.result
    }

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

    // Increment play count (Only for non-custom results or first time)
    if (result.id !== 'custom') {
        await prisma.quiz.update({
            where: { id },
            data: { plays: { increment: 1 } }
        })
    }

    // 공유를 위한 압축 데이터 생성 (이미 compressedData가 있으면 그것을 사용, 없으면 새로 생성)
    const resultToCompress = compressedData || compressData({
        t: result.title,
        d: result.description,
        q: quiz.title,
        i: result.imageUrl
    });

    return <ResultDisplay
        quiz={quiz}
        result={result}
        score={score}
        resultType={quiz.resultType}
        typeCode={typeParam}
        compressedData={resultToCompress}
    />
}
