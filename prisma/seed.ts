import { PrismaClient, ResultType } from '@prisma/client'

const prisma = new PrismaClient() as any

async function main() {
    // 1. 기존 데이터 삭제
    await prisma.option.deleteMany()
    await prisma.question.deleteMany()
    await prisma.result.deleteMany()
    await prisma.quiz.deleteMany()

    console.log('🗑️  기존 데이터를 삭제하고 새로운 고품질 예제들을 생성합니다.')

    // 2. 점수형 (SCORE_BASED) 퀴즈: 나의 멘탈 회복탄력성 테스트
    const resilienceQuiz = await prisma.quiz.create({
        data: {
            title: '나의 강력한 멘탈 회복탄력성 테스트',
            description: '힘든 상황이 닥쳤을 때 당신은 얼마나 빨리 일어설 수 있나요? 과학적인 지표를 바탕으로 당신의 마음 근육을 체크해보세요.',
            imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
            resultType: ResultType.SCORE_BASED,
            questions: {
                create: [
                    {
                        order: 1,
                        content: '예상치 못한 실패를 겪었을 때, 다시 시작할 용기를 내는 편인가요?',
                        options: {
                            create: [
                                { content: '매우 그렇다', score: 10 },
                                { content: '어느 정도 그렇다', score: 7 },
                                { content: '그저 그렇다', score: 4 },
                                { content: '전혀 그렇지 않다', score: 0 }
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '스스로의 감정을 잘 파악하고 조절할 수 있다고 느끼나요?',
                        options: {
                            create: [
                                { content: '완벽하게 조절한다', score: 10 },
                                { content: '어렵지만 노력하는 편이다', score: 7 },
                                { content: '감정에 휘둘릴 때가 많다', score: 3 },
                                { content: '거의 조절하기 힘들다', score: 0 }
                            ]
                        }
                    },
                    {
                        order: 3,
                        content: '새로운 환경이나 변화에 적응하는 것이 즐거운가요?',
                        options: {
                            create: [
                                { content: '매우 즐겁고 흥분된다', score: 10 },
                                { content: '적응하는 데 큰 무리가 없다', score: 7 },
                                { content: '스트레스를 조금 받는다', score: 3 },
                                { content: '변화가 너무 두렵고 힘들다', score: 0 }
                            ]
                        }
                    },
                    {
                        order: 4,
                        content: '주변 사람들과의 관계가 나에게 든든한 버팀목이 되나요?',
                        options: {
                            create: [
                                { content: '나를 믿어주는 사람이 많다', score: 10 },
                                { content: '소수의 깊은 관계가 있다', score: 7 },
                                { content: '형식적인 관계가 대부분이다', score: 3 },
                                { content: '주변에 의지할 사람이 없다', score: 0 }
                            ]
                        }
                    },
                    {
                        order: 5,
                        content: '나는 미래가 지금보다 나아질 것이라고 믿나요?',
                        options: {
                            create: [
                                { content: '확신한다', score: 10 },
                                { content: '낙관적으로 보려 노력한다', score: 7 },
                                { content: '잘 모르겠다', score: 4 },
                                { content: '비관적으로 느껴진다', score: 0 }
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        title: '단단한 강철 멘탈 💎',
                        description: '축하합니다! 당신은 어떤 비바람에도 흔들리지 않는 뿌리 깊은 나무와 같습니다. 높은 회복탄력성으로 주변 사람들에게도 긍정적인 에너지를 전파하고 있네요.',
                        minScore: 41,
                        maxScore: 50,
                        imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80'
                    },
                    {
                        title: '유연한 대나무 마음 🎋',
                        description: '당신은 적절한 유연성을 가진 건강한 마음의 소유자입니다. 때로는 힘들어도 금방 자신만의 페이스를 찾는 능력이 탁월하시군요.',
                        minScore: 26,
                        maxScore: 40,
                        imageUrl: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=400&q=80'
                    },
                    {
                        title: '섬세한 유리 조각 🎐',
                        description: '지금은 마음이 조금 지쳐있는 상태일지도 몰라요. 작은 충격에도 쉽게 상처받을 수 있으니, 자신을 따뜻하게 안아주고 충분한 휴식을 선물해 주세요.',
                        minScore: 11,
                        maxScore: 25,
                        imageUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?w=400&q=80'
                    },
                    {
                        title: '깊은 쉼이 필요한 파도 🌊',
                        description: '마음의 폭풍우 속에 계신 것 같아요. 혼자서 이겨내기보다는 신뢰할 수 있는 사람에게 도움을 청하거나, 나만의 안식처에서 에너지를 회복하는 시간이 절실합니다.',
                        minScore: 0,
                        maxScore: 10,
                        imageUrl: 'https://images.unsplash.com/photo-1439405326854-01523a114f9e?w=400&q=80'
                    }
                ]
            }
        }
    })

    // 3. 조합형 (TYPE_BASED) 퀴즈: 나의 전설속 판타지 직업 찾기 (3코드 조합)
    const fantasyQuiz = await prisma.quiz.create({
        data: {
            title: '나의 전설속 판타지 직업 찾기',
            description: '당신의 성향을 분석하여 판타지 세계에서 어떤 능력을 가진 영웅이 될지 3가지 속성을 조합해 알려드립니다!',
            imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&q=80',
            resultType: ResultType.TYPE_BASED,
            typeCodeLimit: 3,
            questions: {
                create: [
                    {
                        order: 1,
                        content: '전장에 나설 때 당신의 가장 큰 무기는?',
                        options: {
                            create: [
                                { content: '압도적인 힘과 체력', resultTypeCode: 'W' },
                                { content: '치밀한 전략과 지혜', resultTypeCode: 'M' },
                                { content: '민첩한 몸놀림', resultTypeCode: 'R' }
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '위기에 처한 동료를 보았을 때 당신은?',
                        options: {
                            create: [
                                { content: '앞장서서 적을 막아선다', resultTypeCode: 'W' },
                                { content: '치유의 마법으로 회복시킨다', resultTypeCode: 'P' },
                                { content: '교란 작전으로 적의 시선을 끈다', resultTypeCode: 'R' }
                            ]
                        }
                    },
                    {
                        order: 3,
                        content: '당신이 가장 선호하는 탐험 장소는?',
                        options: {
                            create: [
                                { content: '고대 지식이 잠든 도서관', resultTypeCode: 'M' },
                                { content: '활기찬 사람들의 노래가 있는 광장', resultTypeCode: 'B' },
                                { content: '아무도 모르는 어두운 지하 던전', resultTypeCode: 'S' }
                            ]
                        }
                    },
                    {
                        order: 4,
                        content: '사람들과 갈등이 생겼을 때 해결 방식은?',
                        options: {
                            create: [
                                { content: '아름다운 말과 예술로 설득한다', resultTypeCode: 'B' },
                                { content: '정의로운 원칙과 법대로 처리한다', resultTypeCode: 'L' },
                                { content: '조용히 뒤에서 문제를 해결한다', resultTypeCode: 'S' }
                            ]
                        }
                    },
                    {
                        order: 5,
                        content: '당신의 가치관 중 가장 중요한 것은?',
                        options: {
                            create: [
                                { content: '절대적인 힘과 승리', resultTypeCode: 'W' },
                                { content: '세상의 진리와 깨달음', resultTypeCode: 'M' },
                                { content: '동료와의 깊은 유대감', resultTypeCode: 'P' }
                            ]
                        }
                    },
                    {
                        order: 6,
                        content: '휴식 시간에는 무엇을 하시겠습니까?',
                        options: {
                            create: [
                                { content: '악기를 연주하거나 노래를 부른다', resultTypeCode: 'B' },
                                { content: '다음 작전을 위해 지도를 분석한다', resultTypeCode: 'L' },
                                { content: '정체를 숨기고 시장을 구경한다', resultTypeCode: 'R' }
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        title: '전설의 성스러운 수호자 (WPL)',
                        description: '강인한 힘(W)과 따뜻한 치유(P), 그리고 정의감(L)을 모두 갖춘 당신! 전장의 최전선에서 모두를 지키는 상징적인 리더입니다.',
                        typeCode: 'WPL',
                        imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400&q=80'
                    },
                    {
                        title: '그림자 속의 마법 탐험가 (MRS)',
                        description: '지적인 마법 실력(M)과 은밀함(S), 그리고 민첩함(R)을 가진 당신! 아무도 도달하지 못한 비밀의 땅을 가장 먼저 밝혀내는 탐험 전문가입니다.',
                        typeCode: 'MRS',
                        imageUrl: 'https://images.unsplash.com/photo-1519074063912-ad25b57b984a?w=400&q=80'
                    },
                    {
                        title: '자유로운 유랑 시인 (BRS)',
                        description: '재치 있는 입담(B)과 자유로운 영혼(R), 그리고 눈에 인식되지 않는 은밀함(S)을 가졌군요. 세상을 여행하며 전설을 노래하는 음유시인입니다.',
                        typeCode: 'BRS',
                        imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'
                    },
                    {
                        title: '심연의 마법 전사 (MSW)',
                        description: '강한 근력(W)과 깊은 지식(M), 그리고 신비로운 분위기(S)를 가진 당신. 마법과 검술을 동시에 다루는 신비로운 전사입니다.',
                        typeCode: 'MSW',
                        imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80'
                    }
                ]
            }
        }
    })

    console.log('✅ 고품질 예제 데이터 생성이 완료되었습니다!')
    console.log(`- 퀴즈(점수형) ID: ${resilienceQuiz.id}`)
    console.log(`- 퀴즈(조합형) ID: ${fantasyQuiz.id}`)
}

main()
    .catch((e) => {
        console.error('❌ 시드 생성 중 오류 발생:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
