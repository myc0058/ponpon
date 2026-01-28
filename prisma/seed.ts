import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Create a sample test
    const test = await prisma.test.create({
        data: {
            title: '나는 어떤 크리스마스 선물?',
            description: '당신의 성격을 분석해서 어울리는 크리스마스 선물을 알려드려요!',
            imageUrl: 'https://placehold.co/600x400/ec4899/white?text=Christmas+Gift',
            questions: {
                create: [
                    {
                        order: 1,
                        content: '친구들과 파티를 할 때 당신은?',
                        options: {
                            create: [
                                { content: '분위기 메이커! 모두를 즐겁게 해요', score: 10 },
                                { content: '조용히 옆에서 지켜봐요', score: 5 },
                                { content: '음식 준비를 도와요', score: 7 }
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '선물을 받을 때 가장 중요한 것은?',
                        options: {
                            create: [
                                { content: '실용성', score: 5 },
                                { content: '감성적인 의미', score: 10 },
                                { content: '가격', score: 3 }
                            ]
                        }
                    },
                    {
                        order: 3,
                        content: '크리스마스 이브에 하고 싶은 것은?',
                        options: {
                            create: [
                                { content: '친구들과 파티', score: 8 },
                                { content: '집에서 영화 보기', score: 5 },
                                { content: '연인과 데이트', score: 10 }
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        title: '🎁 장난감 로봇',
                        description: '당신은 활발하고 재미있는 성격이에요! 항상 주변을 즐겁게 만드는 당신에게는 신기하고 재미있는 장난감 로봇이 딱이에요.',
                        minScore: 20,
                        maxScore: 30,
                        isPremium: false,
                        imageUrl: 'https://placehold.co/400x400/3b82f6/white?text=Robot'
                    },
                    {
                        title: '📚 베스트셀러 책',
                        description: '당신은 조용하고 사려깊은 성격이에요. 혼자만의 시간을 즐기는 당신에게는 감동적인 베스트셀러 책이 어울려요.',
                        minScore: 10,
                        maxScore: 19,
                        isPremium: false,
                        imageUrl: 'https://placehold.co/400x400/10b981/white?text=Book'
                    },
                    {
                        title: '💎 프리미엄 향수',
                        description: '당신은 세련되고 감각적인 성격이에요! 특별한 순간을 소중히 여기는 당신에게는 고급스러운 향수가 완벽해요.',
                        minScore: 0,
                        maxScore: 9,
                        isPremium: true,
                        imageUrl: 'https://placehold.co/400x400/ec4899/white?text=Perfume'
                    }
                ]
            }
        }
    })

    console.log('✅ Sample test created:', test.title)
    console.log('📝 Test ID:', test.id)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
