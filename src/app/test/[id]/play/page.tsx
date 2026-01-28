import { prisma } from '@/lib/prisma'
import TestPlayer from './TestPlayer'

export default async function TestPlayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const test = await prisma.test.findUnique({
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

    if (!test) {
        return <div>Test not found</div>
    }

    return <TestPlayer test={test} />
}
