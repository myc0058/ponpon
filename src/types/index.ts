export interface Quiz {
    id: string
    title: string
    description: string
    imageUrl?: string | null
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    typeCodeLimit: number
    isFeatured: boolean
    isHot: boolean
    isVisible: boolean
    createdAt: Date
    updatedAt: Date
    plays: number
}

export interface Question {
    id: string
    quizId: string
    content: string
    imageUrl?: string | null
    order: number
    options?: Option[]
}

export interface Option {
    id: string
    questionId: string
    content: string
    score: number
    resultTypeCode?: string | null
}

export interface Result {
    id: string
    quizId: string
    title: string
    description: string
    imageUrl?: string | null
    minScore: number
    maxScore: number
    typeCode?: string | null
    isPremium: boolean
}

