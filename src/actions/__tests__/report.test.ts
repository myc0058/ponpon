/**
 * @jest-environment node
 */
import { createReport } from '../report'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
    prisma: {
        report: {
            create: jest.fn(),
        },
    },
}))

describe('Server Actions - Report', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createReport', () => {
        it('should create a report successfully', async () => {
            const mockReport = { id: 'report123', quizId: 'quiz1', reason: 'UI_ERROR' }
                ; (prisma.report.create as jest.Mock).mockResolvedValue(mockReport)

            const result = await createReport({
                quizId: 'quiz1',
                reason: 'UI_ERROR',
                content: 'Broken UI'
            })

            expect(prisma.report.create).toHaveBeenCalledWith({
                data: {
                    quizId: 'quiz1',
                    resultId: undefined,
                    reason: 'UI_ERROR',
                    content: 'Broken UI',
                },
            })
            expect(result).toEqual({ success: true, id: 'report123' })
        })

        it('should return error on failure', async () => {
            ; (prisma.report.create as jest.Mock).mockRejectedValue(new Error('DB Error'))

            const result = await createReport({
                quizId: 'quiz1',
                reason: 'UI_ERROR',
            })

            expect(result).toEqual({ success: false, error: '신고를 제출하는 중 오류가 발생했습니다.' })
        })
    })
})
