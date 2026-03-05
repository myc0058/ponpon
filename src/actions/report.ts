'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createReport(data: {
    quizId: string
    resultId?: string
    reason: string
    content?: string
}) {
    try {
        const report = await prisma.report.create({
            data: {
                quizId: data.quizId,
                resultId: data.resultId,
                reason: data.reason,
                content: data.content,
            },
        })
        return { success: true, id: report.id }
    } catch (error) {
        console.error('Failed to create report:', error)
        return { success: false, error: '신고를 제출하는 중 오류가 발생했습니다.' }
    }
}
