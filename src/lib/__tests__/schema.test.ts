import { quizSchema } from '../schema'

describe('Quiz Schema Validation', () => {
    it('should validate a valid quiz object', () => {
        const validQuiz = {
            title: 'My Quiz',
            description: 'A fun quiz',
            imageUrl: 'https://example.com/image.jpg',
            typeCodeLimit: 3,
            resultType: 'TYPE_BASED',
            isVisible: true,
        }

        const result = quizSchema.safeParse(validQuiz)
        expect(result.success).toBe(true)
    })

    it('should accept default values', () => {
        const minimalQuiz = {
            title: 'Minimal Quiz',
            description: 'Just basics',
        }

        const result = quizSchema.safeParse(minimalQuiz)
        expect(result.success).toBe(true)
        if (result.success) {
            expect(result.data.typeCodeLimit).toBe(2)
            expect(result.data.resultType).toBe('SCORE_BASED')
            expect(result.data.isVisible).toBe(false)
        }
    })

    it('should fail when required fields are missing', () => {
        const invalidQuiz = {
            imageUrl: 'https://example.com/image.jpg',
        }

        const result = quizSchema.safeParse(invalidQuiz)
        expect(result.success).toBe(false)
    })

    it('should fail when field constraints are violated', () => {
        const invalidQuiz = {
            title: 'Quiz',
            description: 'Desc',
            typeCodeLimit: 0.5, // Should be integer
        }

        const result = quizSchema.safeParse(invalidQuiz)
        expect(result.success).toBe(false)
    })
})
