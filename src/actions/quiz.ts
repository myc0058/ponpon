'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

// 이미지 삭제 헬퍼 함수
async function deleteImageFromStorage(imageUrl: string | null) {
    if (!imageUrl) return

    try {
        // URL에서 파일 경로 추출
        // 예: .../storage/v1/object/public/quiz-images/filename.jpg -> filename.jpg
        const urlObj = new URL(imageUrl)
        const pathParts = urlObj.pathname.split('/')
        // 'quiz-images' 다음부터가 실제 경로
        const bucketIndex = pathParts.indexOf('quiz-images')

        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            const filePath = pathParts.slice(bucketIndex + 1).join('/')
            console.log(`Deleting image from storage: ${filePath}`)

            const { error } = await supabaseAdmin.storage
                .from('quiz-images')
                .remove([filePath])

            if (error) {
                console.error('Failed to delete image from Supabase:', error)
            }
        }
    } catch (e) {
        console.error('Error parsing image URL for deletion:', e)
    }
}

export async function createQuiz(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    await prisma.quiz.create({
        data: {
            title,
            description,
            imageUrl,
            typeCodeLimit: parseInt(formData.get('typeCodeLimit') as string) || 2,
        },
    })

    revalidatePath('/admin')
    redirect('/admin')
}

export async function getQuizzes() {
    return await prisma.quiz.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

export async function deleteQuiz(id: string) {
    // 퀴즈 삭제 시 관련 모든 이미지 삭제 로직이 필요할 수 있음
    // 현재는 질문/결과 개별 삭제 시 이미지 삭제 로직만 구현
    await prisma.quiz.delete({
        where: { id },
    })
    revalidatePath('/admin')
}

export async function toggleQuizFeatured(id: string, isFeatured: boolean) {
    'use server'
    await prisma.quiz.update({
        where: { id },
        data: { isFeatured }
    })
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function getQuizWithDetails(id: string) {
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
    }) as any

    if (quiz) {
        console.log(`[getQuizWithDetails] ID: ${id}`)

        // 필드가 유실된 경우 (Prisma Client 캐시 문제 등) 를 위해 생쿼리(Raw Query)로 직접 DB 조회
        if (quiz.typeCodeLimit === undefined || quiz.typeCodeLimit === null) {
            try {
                const rawData: any = await prisma.$queryRawUnsafe(
                    'SELECT typeCodeLimit FROM Quiz WHERE id = ?',
                    id
                )
                if (rawData && rawData.length > 0 && rawData[0].typeCodeLimit !== undefined) {
                    console.log(`- typeCodeLimit found via Raw Query: ${rawData[0].typeCodeLimit}`)
                    quiz.typeCodeLimit = rawData[0].typeCodeLimit
                } else {
                    console.error('CRITICAL: typeCodeLimit is missing even in Raw Query!')
                    quiz.typeCodeLimit = 2
                }
            } catch (rawError) {
                console.error('Raw Query failed:', rawError)
                quiz.typeCodeLimit = 2
            }
        }
    }
    return quiz
}

// Questions
export async function createQuestion(quizId: string, formData: FormData) {
    const content = formData.get('content') as string
    const imageUrl = formData.get('imageUrl') as string
    const order = parseInt(formData.get('order') as string) || 0

    await prisma.question.create({
        data: {
            quizId,
            content,
            imageUrl,
            order
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

export async function deleteQuestion(id: string, quizId: string) {
    // 삭제 전 이미지 정보 조회를 위해 먼저 findUnique
    const question = await prisma.question.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (question?.imageUrl) {
        await deleteImageFromStorage(question.imageUrl)
    }

    await prisma.question.delete({ where: { id } })
    revalidatePath(`/admin/${quizId}/edit`)
}

export async function updateQuestion(id: string, quizId: string, formData: FormData) {
    const content = formData.get('content') as string
    const imageUrl = formData.get('imageUrl') as string
    const order = parseInt(formData.get('order') as string) || 0

    // 기존 이미지와 비교하여 변경되었으면 이전 이미지 삭제
    const oldQuestion = await prisma.question.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (oldQuestion?.imageUrl && oldQuestion.imageUrl !== imageUrl) {
        await deleteImageFromStorage(oldQuestion.imageUrl)
    }

    await prisma.question.update({
        where: { id },
        data: {
            content,
            imageUrl,
            order
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Options
export async function createOption(questionId: string, quizId: string, formData: FormData) {
    const content = formData.get('content') as string
    const score = parseInt(formData.get('score') as string) || 0
    const resultTypeCode = formData.get('resultTypeCode') as string | null

    await prisma.option.create({
        data: {
            questionId,
            content,
            score,
            resultTypeCode: resultTypeCode || null
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

export async function deleteOption(id: string, quizId: string) {
    await prisma.option.delete({ where: { id } })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Results
export async function createResult(quizId: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const minScore = parseInt(formData.get('minScore') as string) || 0
    const maxScore = parseInt(formData.get('maxScore') as string) || 0
    const typeCode = formData.get('typeCode') as string | null
    const isPremium = formData.get('isPremium') === 'on'

    await prisma.result.create({
        data: {
            quizId,
            title,
            description,
            imageUrl,
            minScore,
            maxScore,
            typeCode: typeCode || null,
            isPremium
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

export async function deleteResult(id: string, quizId: string) {
    const result = await prisma.result.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (result?.imageUrl) {
        await deleteImageFromStorage(result.imageUrl)
    }

    await prisma.result.delete({ where: { id } })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Update Quiz
export async function updateQuiz(id: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const resultType = formData.get('resultType') as 'SCORE_BASED' | 'TYPE_BASED'

    const typeCodeLimit = parseInt(formData.get('typeCodeLimit') as string) || 2
    console.log(`[UpdateQuiz] ID: ${id}, typeCodeLimit: ${typeCodeLimit}`)

    await prisma.quiz.update({
        where: { id },
        data: {
            title,
            description,
            imageUrl,
            resultType,
            typeCodeLimit
        }
    })

    // Prisma Client가 예전 버전일 경우를 대비해 Raw Query로 한 번 더 확실히 업데이트
    try {
        await prisma.$executeRawUnsafe(
            'UPDATE Quiz SET typeCodeLimit = ? WHERE id = ?',
            typeCodeLimit,
            id
        )
        console.log(`[UpdateQuiz] Raw fallback updated typeCodeLimit to ${typeCodeLimit}`)
    } catch (e) {
        console.error('Raw update failed:', e)
    }

    revalidatePath(`/admin/${id}/edit`)
    revalidatePath(`/admin/${id}/settings`)
    revalidatePath('/admin')
    redirect(`/admin/${id}/settings`)
}

// Update Option (for type codes)
export async function updateOption(id: string, quizId: string, formData: FormData) {
    const content = formData.get('content') as string
    const score = parseInt(formData.get('score') as string) || 0
    const resultTypeCode = formData.get('resultTypeCode') as string | null

    await prisma.option.update({
        where: { id },
        data: {
            content,
            score,
            resultTypeCode: resultTypeCode || null
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Update Result (for type codes)
export async function updateResult(id: string, quizId: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const minScore = parseInt(formData.get('minScore') as string) || 0
    const maxScore = parseInt(formData.get('maxScore') as string) || 0
    const typeCode = formData.get('typeCode') as string | null
    const isPremium = formData.get('isPremium') === 'on'

    const oldResult = await prisma.result.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (oldResult?.imageUrl && oldResult.imageUrl !== imageUrl) {
        await deleteImageFromStorage(oldResult.imageUrl)
    }

    await prisma.result.update({
        where: { id },
        data: {
            title,
            description,
            imageUrl,
            minScore,
            maxScore,
            typeCode: typeCode || null,
            isPremium
        }
    })
    revalidatePath(`/admin/${quizId}/edit`)
}
