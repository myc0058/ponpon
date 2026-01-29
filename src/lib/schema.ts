import { z } from 'zod'

export const quizSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    imageUrl: z.string().optional(),
    typeCodeLimit: z.number().int().min(1).default(2),
    resultType: z.enum(['SCORE_BASED', 'TYPE_BASED']).default('SCORE_BASED'),
})

export const questionSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    imageUrl: z.string().optional(),
    order: z.number().int().default(0),
})

export const optionSchema = z.object({
    content: z.string().min(1, 'Content is required'),
    score: z.number().int().default(0),
    resultTypeCode: z.string().optional().nullable(),
})

export const resultSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    imageUrl: z.string().optional(),
    minScore: z.number().int().default(0),
    maxScore: z.number().int().default(0),
    typeCode: z.string().optional().nullable(),
    isPremium: z.boolean().default(false),
})
