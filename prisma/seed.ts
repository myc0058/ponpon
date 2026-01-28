import { PrismaClient, ResultType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. 기존 데이터 삭제
    await prisma.option.deleteMany()
    await prisma.question.deleteMany()
    await prisma.result.deleteMany()
    await prisma.quiz.deleteMany()

    console.log('🗑️  기존 데이터를 모두 삭제했습니다.')

    // 2. 점수형 (SCORE_BASED) 퀴즈 데이터 생성
    const scoreQuiz = await prisma.quiz.create({
        data: {
            title: '나의 스트레스 지수 테스트',
            description: '현재 당신의 마음은 어떤 상태인가요? 간단한 질문을 통해 스트레스 지수를 체크해보세요.',
            imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
            resultType: ResultType.SCORE_BASED,
            questions: {
                create: [
                    {
                        order: 1,
                        content: '일주일 동안 충분한 수면을 취하고 있나요?',
                        options: {
                            create: [
                                { content: '매우 그렇다', score: 0 },
                                { content: '보통이다', score: 5 },
                                { content: '거의 그렇지 못하다', score: 10 }
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '작은 일에도 쉽게 예민해지거나 짜증이 나나요?',
                        options: {
                            create: [
                                { content: '전혀 그렇지 않다', score: 0 },
                                { content: '가끔 그렇다', score: 5 },
                                { content: '매우 자주 그렇다', score: 10 }
                            ]
                        }
                    },
                    {
                        order: 3,
                        content: '요즘 입맛이 없거나 폭식을 하는 등 식습관에 변화가 있나요?',
                        options: {
                            create: [
                                { content: '변함없다', score: 0 },
                                { content: '약간의 변화가 있다', score: 5 },
                                { content: '심각한 변화가 있다', score: 10 }
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        title: '평온한 숲속의 사슴 🦌',
                        description: '당신은 아주 안정적인 상태입니다. 현재의 생활 리듬을 잘 유지하고 계시네요!',
                        minScore: 0,
                        maxScore: 10,
                        imageUrl: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=400&q=80'
                    },
                    {
                        title: '조금 지친 길고양이 🐈',
                        description: '스트레스가 조금씩 쌓이고 있어요. 따뜻한 차 한 잔과 함께 휴식을 취하는 건 어떨까요?',
                        minScore: 11,
                        maxScore: 20,
                        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
                    },
                    {
                        title: '폭발 직전의 화산 🌋',
                        description: '지금 당장 휴식이 절실합니다! 모든 일을 잠시 내려놓고 자신만을 위한 시간을 가지세요.',
                        minScore: 21,
                        maxScore: 30,
                        imageUrl: 'https://images.unsplash.com/photo-1580193813605-a5c78b4ee01a?w=400&q=80'
                    }
                ]
            }
        }
    })

    // 3. 조합형 (TYPE_BASED) 퀴즈 데이터 생성
    const typeQuiz = await prisma.quiz.create({
        data: {
            title: '나의 폰폰 캐릭터 찾기',
            description: '당신은 어떤 매력을 가진 캐릭터일까요? 성향 조합을 통해 알아보세요!',
            imageUrl: 'https://images.unsplash.com/photo-1535572290543-960a8046f5af?w=800&q=80',
            resultType: ResultType.TYPE_BASED,
            questions: {
                create: [
                    {
                        order: 1,
                        content: '새로운 사람들과의 모임에서 당신은?',
                        options: {
                            create: [
                                { content: '먼저 다가가 대화를 주도한다', resultTypeCode: 'E' },
                                { content: '상대방이 말을 걸어줄 때까지 기다린다', resultTypeCode: 'I' }
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '친구의 고민을 들어줄 때 당신은?',
                        options: {
                            create: [
                                { content: '현실적인 해결책을 제시해준다', resultTypeCode: 'T' },
                                { content: '함께 감정을 나누며 공감해준다', resultTypeCode: 'F' }
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        title: '열정적인 댕댕이 (ET)',
                        description: '활동적이고 이성적인 판단력을 가진 당신! 어디서나 에너지가 넘치는 리더 타입입니다.',
                        typeCode: 'ET',
                        imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80'
                    },
                    {
                        title: '다정한 해바라기 (EF)',
                        description: '사람들을 좋아하고 따뜻한 공감을 잘해주는 당신! 주변 사람들에게 비타민 같은 존재입니다.',
                        typeCode: 'EF',
                        imageUrl: 'https://images.unsplash.com/photo-1597626122118-24cc92004735?w=400&q=80'
                    },
                    {
                        title: '차분한 올빼미 (IT)',
                        description: '조용히 혼자 있는 시간을 즐기며 논리적인 사고를 하는 당신! 지적이고 냉철한 관찰자 타입입니다.',
                        typeCode: 'IT',
                        imageUrl: 'https://images.unsplash.com/photo-1544391439-1f5c07bf72f1?w=400&q=80'
                    },
                    {
                        title: '섬세한 아기 고양이 (IF)',
                        description: '조용하지만 배려심이 깊고 감수성이 풍부한 당신! 내면의 세계가 아름다운 예술가 타입입니다.',
                        typeCode: 'IF',
                        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80'
                    }
                ]
            }
        }
    })

    console.log('✅ 시드 데이터 생성이 완료되었습니다!')
    console.log(`- 퀴즈(점수형) ID: ${scoreQuiz.id}`)
    console.log(`- 퀴즈(조합형) ID: ${typeQuiz.id}`)
}

main()
    .catch((e) => {
        console.error('❌ 시드 생성 중 오류 발생:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
