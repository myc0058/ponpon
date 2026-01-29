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

import { quizSchema, questionSchema, optionSchema, resultSchema } from '@/lib/schema'

export async function createQuiz(formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl') || undefined,
        typeCodeLimit: parseInt(formData.get('typeCodeLimit') as string) || 2,
        isVisible: formData.get('isVisible') === 'on',
    }

    const validatedFields = quizSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.quiz.create({
        data: validatedFields.data,
    })

    revalidatePath('/admin')
    redirect('/admin')
}

export async function getQuizzes(options?: { includeHidden?: boolean }) {
    const where = options?.includeHidden ? {} : { isVisible: true }
    return await prisma.quiz.findMany({
        where,
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
    })

    if (!quiz) return null
    return quiz
}

// Questions
export async function createQuestion(quizId: string, formData: FormData) {
    const rawData = {
        content: formData.get('content'),
        imageUrl: formData.get('imageUrl') || undefined,
        order: parseInt(formData.get('order') as string) || 0,
    }

    const validatedFields = questionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.question.create({
        data: {
            quizId,
            ...validatedFields.data,
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
    const rawData = {
        content: formData.get('content'),
        imageUrl: formData.get('imageUrl') || undefined,
        order: parseInt(formData.get('order') as string) || 0,
    }

    const validatedFields = questionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    // 기존 이미지와 비교하여 변경되었으면 이전 이미지 삭제
    const oldQuestion = await prisma.question.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (oldQuestion?.imageUrl && oldQuestion.imageUrl !== validatedFields.data.imageUrl) {
        await deleteImageFromStorage(oldQuestion.imageUrl)
    }

    await prisma.question.update({
        where: { id },
        data: validatedFields.data
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Options
export async function createOption(questionId: string, quizId: string, formData: FormData) {
    const rawData = {
        content: formData.get('content'),
        score: parseInt(formData.get('score') as string) || 0,
        resultTypeCode: formData.get('resultTypeCode'),
    }

    const validatedFields = optionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.option.create({
        data: {
            questionId,
            ...validatedFields.data,
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
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl') || undefined,
        minScore: parseInt(formData.get('minScore') as string) || 0,
        maxScore: parseInt(formData.get('maxScore') as string) || 0,
        typeCode: formData.get('typeCode'),
        isPremium: formData.get('isPremium') === 'on',
    }

    const validatedFields = resultSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.result.create({
        data: {
            quizId,
            ...validatedFields.data,
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
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl') || undefined,
        resultType: formData.get('resultType') || undefined,
        typeCodeLimit: parseInt(formData.get('typeCodeLimit') as string) || 2,
        isVisible: formData.get('isVisible') === 'on',
    }

    const validatedFields = quizSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.quiz.update({
        where: { id },
        data: validatedFields.data,
    })

    revalidatePath(`/admin/${id}/edit`)
    revalidatePath(`/admin/${id}/settings`)
    revalidatePath('/admin')
    redirect(`/admin/${id}/settings`)
}

// Update Option (for type codes)
export async function updateOption(id: string, quizId: string, formData: FormData) {
    const rawData = {
        content: formData.get('content'),
        score: parseInt(formData.get('score') as string) || 0,
        resultTypeCode: formData.get('resultTypeCode'),
    }

    const validatedFields = optionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    await prisma.option.update({
        where: { id },
        data: validatedFields.data
    })
    revalidatePath(`/admin/${quizId}/edit`)
}

// Update Result (for type codes)
export async function updateResult(id: string, quizId: string, formData: FormData) {
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        imageUrl: formData.get('imageUrl') || undefined,
        minScore: parseInt(formData.get('minScore') as string) || 0,
        maxScore: parseInt(formData.get('maxScore') as string) || 0,
        typeCode: formData.get('typeCode'),
        isPremium: formData.get('isPremium') === 'on',
    }

    const validatedFields = resultSchema.safeParse(rawData)

    if (!validatedFields.success) {
        throw new Error('Invalid fields')
    }

    const oldResult = await prisma.result.findUnique({
        where: { id },
        select: { imageUrl: true }
    })

    if (oldResult?.imageUrl && oldResult.imageUrl !== validatedFields.data.imageUrl) {
        await deleteImageFromStorage(oldResult.imageUrl)
    }

    await prisma.result.update({
        where: { id },
        data: validatedFields.data
    })
    revalidatePath(`/admin/${quizId}/edit`)
}
