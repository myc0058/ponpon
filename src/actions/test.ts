'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTest(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string

    await prisma.test.create({
        data: {
            title,
            description,
            imageUrl,
        },
    })

    revalidatePath('/admin')
    redirect('/admin')
}

export async function getTests() {
    return await prisma.test.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

export async function deleteTest(id: string) {
    await prisma.test.delete({
        where: { id },
    })
    revalidatePath('/admin')
}

export async function getTestWithDetails(id: string) {
    return await prisma.test.findUnique({
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
}

// Questions
export async function createQuestion(testId: string, formData: FormData) {
    const content = formData.get('content') as string
    const imageUrl = formData.get('imageUrl') as string
    const order = parseInt(formData.get('order') as string) || 0

    await prisma.question.create({
        data: {
            testId,
            content,
            imageUrl,
            order
        }
    })
    revalidatePath(`/admin/${testId}/edit`)
}

export async function deleteQuestion(id: string, testId: string) {
    await prisma.question.delete({ where: { id } })
    revalidatePath(`/admin/${testId}/edit`)
}

// Options
export async function createOption(questionId: string, testId: string, formData: FormData) {
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
    revalidatePath(`/admin/${testId}/edit`)
}

export async function deleteOption(id: string, testId: string) {
    await prisma.option.delete({ where: { id } })
    revalidatePath(`/admin/${testId}/edit`)
}

// Results
export async function createResult(testId: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const minScore = parseInt(formData.get('minScore') as string) || 0
    const maxScore = parseInt(formData.get('maxScore') as string) || 0
    const typeCode = formData.get('typeCode') as string | null
    const isPremium = formData.get('isPremium') === 'on'

    await prisma.result.create({
        data: {
            testId,
            title,
            description,
            imageUrl,
            minScore,
            maxScore,
            typeCode: typeCode || null,
            isPremium
        }
    })
    revalidatePath(`/admin/${testId}/edit`)
}

export async function deleteResult(id: string, testId: string) {
    await prisma.result.delete({ where: { id } })
    revalidatePath(`/admin/${testId}/edit`)
}

// Update Test
export async function updateTest(id: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const resultType = formData.get('resultType') as 'SCORE_BASED' | 'TYPE_BASED'

    await prisma.test.update({
        where: { id },
        data: {
            title,
            description,
            imageUrl,
            resultType
        }
    })
    revalidatePath(`/admin/${id}/edit`)
    revalidatePath(`/admin/${id}/settings`)
    revalidatePath('/admin')
    redirect(`/admin/${id}/settings`)
}

// Update Option (for type codes)
export async function updateOption(id: string, testId: string, formData: FormData) {
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
    revalidatePath(`/admin/${testId}/edit`)
}

// Update Result (for type codes)
export async function updateResult(id: string, testId: string, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageUrl = formData.get('imageUrl') as string
    const minScore = parseInt(formData.get('minScore') as string) || 0
    const maxScore = parseInt(formData.get('maxScore') as string) || 0
    const typeCode = formData.get('typeCode') as string | null
    const isPremium = formData.get('isPremium') === 'on'

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
    revalidatePath(`/admin/${testId}/edit`)
}
