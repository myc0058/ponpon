/**
 * @jest-environment node
 */
import { createQuiz, updateQuiz, deleteQuiz, createQuestion, updateQuestion, deleteQuestion, createOption, updateOption, deleteOption, createResult, updateResult, deleteResult } from '../quiz'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        quiz: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        question: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        },
        option: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        result: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}))

jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}))

jest.mock('next/navigation', () => ({
    redirect: jest.fn(),
}))

// Mock Supabase admin just in case, though not used in createQuiz directly
jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        storage: {
            from: jest.fn(),
        },
    },
}))

describe('Server Actions - Quiz', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createQuiz', () => {
        it('should create a quiz and redirect on success', async () => {
            const formData = new FormData()
            formData.append('title', 'Test Quiz')
            formData.append('description', 'Test Description')
            formData.append('typeCodeLimit', '2')
                // checkbox not present means false

                ; (prisma.quiz.create as jest.Mock).mockResolvedValue({
                    id: 'quiz123',
                    title: 'Test Quiz',
                })

            // Since redirect throws in Next.js, we mock it. 
            // Sometimes it's better to wrap in try/catch if testing the throw, 
            // but here we just want to ensure it's called.

            await createQuiz(formData)

            expect(prisma.quiz.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: 'Test Quiz',
                    description: 'Test Description',
                    typeCodeLimit: 2,
                    isVisible: false,
                }),
            })

            expect(revalidatePath).toHaveBeenCalledWith('/admin')
            expect(redirect).toHaveBeenCalledWith('/admin')
        })

        it('should throw error on invalid data', async () => {
            const formData = new FormData()
            // Missing title and description

            await expect(createQuiz(formData)).rejects.toThrow('Invalid fields')

            expect(prisma.quiz.create).not.toHaveBeenCalled()
        })
    })

    describe('updateQuiz', () => {
        it('should update quiz and redirect', async () => {
            const formData = new FormData()
            formData.append('title', 'Updated Title')
            formData.append('description', 'Updated Desc')
            formData.append('typeCodeLimit', '3')
            formData.append('isVisible', 'on')

                // Mock update
                ; (prisma.quiz.update as jest.Mock).mockResolvedValue({
                    id: 'quiz123',
                    title: 'Updated Title',
                })

            const id = 'quiz123'
            await updateQuiz(id, formData)

            expect(prisma.quiz.update).toHaveBeenCalledWith({
                where: { id },
                data: expect.objectContaining({
                    title: 'Updated Title',
                    typeCodeLimit: 3,
                    isVisible: true,
                })
            })

            expect(revalidatePath).toHaveBeenCalledWith('/admin')
            expect(redirect).toHaveBeenCalledWith(`/admin/${id}/settings`)
        })
    })

    describe('deleteQuiz', () => {
        it('should delete quiz and revalidate', async () => {
            const id = 'quiz123'

            await deleteQuiz(id)

            expect(prisma.quiz.delete).toHaveBeenCalledWith({
                where: { id }
            })
            expect(revalidatePath).toHaveBeenCalledWith('/admin')
        })
    })

    describe('Questions', () => {
        describe('createQuestion', () => {
            it('should create question and revalidate', async () => {
                const formData = new FormData()
                formData.append('content', 'Question?')
                formData.append('order', '1')

                const quizId = 'quiz123'

                await createQuestion(quizId, formData)

                expect(prisma.question.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        quizId,
                        content: 'Question?',
                        order: 1
                    })
                })
                expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
            })
        })

        describe('updateQuestion', () => {
            it('should update question content and revalidate', async () => {
                const formData = new FormData()
                formData.append('content', 'Updated Question?')
                formData.append('order', '2')

                const id = 'q1'
                const quizId = 'quiz123'

                await updateQuestion(id, quizId, formData)

                expect(prisma.question.update).toHaveBeenCalledWith({
                    where: { id },
                    data: expect.objectContaining({
                        content: 'Updated Question?',
                        order: 2
                    })
                })
                expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
            })
        })

        describe('deleteQuestion', () => {
            it('should delete question and revalidate', async () => {
                const id = 'q1'
                const quizId = 'quiz123'

                await deleteQuestion(id, quizId)

                expect(prisma.question.delete).toHaveBeenCalledWith({
                    where: { id }
                })
                expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
            })

            it('should delete image if exists', async () => {
                const id = 'q1-with-image'
                const quizId = 'quiz123'
                const imageUrl = 'https://supabase.co/storage/v1/object/public/quiz-images/test.jpg'

                    // Mock finding question with image
                    ; (prisma.question.findUnique as jest.Mock).mockResolvedValue({
                        id,
                        imageUrl
                    })

                // Mock supabase response
                const removeMock = jest.fn().mockResolvedValue({ error: null })
                const fromMock = jest.fn().mockReturnValue({ remove: removeMock })
                // access the mocked module
                const { supabaseAdmin } = require('@/lib/supabase-admin')
                supabaseAdmin.storage.from = fromMock

                await deleteQuestion(id, quizId)

                expect(fromMock).toHaveBeenCalledWith('quiz-images')
                expect(removeMock).toHaveBeenCalledWith(['test.jpg'])
            })
        })
    })


    describe('Options', () => {
        describe('createOption', () => {
            it('should create option and revalidate', async () => {
                const formData = new FormData()
                formData.append('content', 'Option 1')
                formData.append('score', '10')

                const questionId = 'q1'
                const quizId = 'quiz123'

                await createOption(questionId, quizId, formData)

                expect(prisma.option.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        questionId,
                        content: 'Option 1',
                        score: 10
                    })
                })
                expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
            })
        })
    })

    describe('updateOption', () => {
        it('should update option and revalidate', async () => {
            const formData = new FormData()
            formData.append('content', 'Updated Option')
            formData.append('score', '20')

            const id = 'opt1'
            const quizId = 'quiz123'

            await updateOption(id, quizId, formData)

            expect(prisma.option.update).toHaveBeenCalledWith({
                where: { id },
                data: expect.objectContaining({
                    content: 'Updated Option',
                    score: 20
                })
            })
            expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
        })
    })

    describe('deleteOption', () => {
        it('should delete option and revalidate', async () => {
            const id = 'opt1'
            const quizId = 'quiz123'

            await deleteOption(id, quizId)

            expect(prisma.option.delete).toHaveBeenCalledWith({
                where: { id }
            })
            expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
        })
    })


    describe('Results', () => {
        describe('createResult', () => {
            it('should create result and revalidate', async () => {
                const formData = new FormData()
                formData.append('title', 'You are A')
                formData.append('description', 'Desc A')
                formData.append('minScore', '0')
                formData.append('maxScore', '10')

                const quizId = 'quiz123'

                await createResult(quizId, formData)

                expect(prisma.result.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        quizId,
                        title: 'You are A',
                        minScore: 0,
                        maxScore: 10
                    })
                })
                expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
            })
        })
    })

    describe('updateResult', () => {
        it('should update result and revalidate', async () => {
            const formData = new FormData()
            formData.append('title', 'Updated Result')
            formData.append('description', 'Updated Desc')
            formData.append('minScore', '5')
            formData.append('maxScore', '15')

            const id = 'res1'
            const quizId = 'quiz123'

                // Mock findUnique for image check (returns null/no image for simple case)
                ; (prisma.result.findUnique as jest.Mock).mockResolvedValue({ id, imageUrl: null })

            await updateResult(id, quizId, formData)

            expect(prisma.result.update).toHaveBeenCalledWith({
                where: { id },
                data: expect.objectContaining({
                    title: 'Updated Result',
                    minScore: 5,
                    maxScore: 15
                })
            })
            expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
        })
    })

    describe('deleteResult', () => {
        it('should delete result and revalidate', async () => {
            const id = 'res1'
            const quizId = 'quiz123'

                // Mock findUnique for image check
                ; (prisma.result.findUnique as jest.Mock).mockResolvedValue({ id, imageUrl: null })

            await deleteResult(id, quizId)

            expect(prisma.result.delete).toHaveBeenCalledWith({
                where: { id }
            })
            expect(revalidatePath).toHaveBeenCalledWith(`/admin/${quizId}/edit`)
        })
    })
})
