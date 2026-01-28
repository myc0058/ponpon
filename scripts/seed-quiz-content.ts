import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding quiz content...')

    // 1. Create the Quiz
    const quiz = await prisma.quiz.create({
        data: {
            title: '남들이 보는 나 vs 내가 아는 나 [반전 매력 테스트]',
            description: '혹시 나... 이중인격일까? 소름 돋는 팩트 폭격기 가동! 🚀',
            imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/quiz-main.jpg',
            resultType: 'TYPE_BASED',
            typeCodeLimit: 2, // 2자리 코드 (예: ES, IH)
            questions: {
                create: [
                    // Part 1: E vs I
                    {
                        order: 1,
                        content: '엘리베이터 거울 속 내 모습을 볼 때, 나는?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-01.jpg',
                        options: {
                            create: [
                                { content: '"오늘 상태 좀 괜찮은데?" 이리저리 표정 지어본다.', resultTypeCode: 'E' },
                                { content: '(슬쩍 보고) 머리 삐친 데 없나 확인하고 끝.', resultTypeCode: 'I' },
                                { content: '아무도 없으면 춤 한 번 추거나 셀카를 찍는다.', resultTypeCode: 'E' },
                            ]
                        }
                    },
                    {
                        order: 2,
                        content: '오랜만에 나간 동창회! 문을 열고 들어갈 때 나는?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-02.jpg',
                        options: {
                            create: [
                                { content: '"야!! 잘 지냈냐!!" 손 흔들며 화려하게 등장.', resultTypeCode: 'E' },
                                { content: '(아는 얼굴 있나 스캔하며) 조용히 구석 자리나 아는 친구 옆으로 간다.', resultTypeCode: 'I' },
                            ]
                        }
                    },
                    {
                        order: 3,
                        content: '친구가 "너 오늘 좀 달라 보인다?"라고 했을 때 나의 반응은?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-03.jpg',
                        options: {
                            create: [
                                { content: '"오 진짜? 예뻐졌어? 살 빠졌어?" (관심 즐김)', resultTypeCode: 'E' },
                                { content: '"어? 뭐가? (뭐 묻었나?)" (약간 당황)', resultTypeCode: 'I' },
                            ]
                        }
                    },
                    {
                        order: 4,
                        content: '길을 가다 무대 행사에서 사회자가 지원자를 찾는다! 상품은 꽤 쏠쏠하다.',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-04.jpg',
                        options: {
                            create: [
                                { content: '(눈치보다가) 아무도 안 나가면 내가 슬쩍... 아니 번쩍 손을 든다!', resultTypeCode: 'E' },
                                { content: '제발 나랑 눈만 마주치지 마라... 고개를 숙인다.', resultTypeCode: 'I' },
                            ]
                        }
                    },
                    {
                        order: 5,
                        content: '단톡방에 알람이 300개가 쌓였다. 나의 대처는?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-05.jpg',
                        options: {
                            create: [
                                { content: '"무슨 일이야!!" 바로 참전해서 수다 떨기 시작한다.', resultTypeCode: 'E' },
                                { content: "'헐 언제 다 읽어...' 일단 'ㅋㅋㅋㅋ' 하나 치고 눈팅하거나 나중에 읽는다.", resultTypeCode: 'I' },
                            ]
                        }
                    },
                    // Part 2: S vs H
                    {
                        order: 6,
                        content: '친구가 "나 우울해서 머리 잘랐어"라고 카톡을 보냈다. 내 속마음은?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-06.jpg',
                        options: {
                            create: [
                                { content: "'헐 ㅠㅠ 무슨 일 있지...' 우울한 이유부터 걱정된다.", resultTypeCode: 'S' },
                                { content: "'머리? 사진 궁금하다.' 잘 어울리는지, 얼마 들었는지가 먼저 궁금하다.", resultTypeCode: 'H' },
                            ]
                        }
                    },
                    {
                        order: 7,
                        content: '실수로 컵을 깼다. 아무도 안 봤는데... 내 머릿속 첫 생각은?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-07.jpg',
                        options: {
                            create: [
                                { content: "'아... 내가 왜 그랬지. 이 컵 아끼던 건데 ㅠㅠ' (자책 모드)", resultTypeCode: 'S' },
                                { content: "'치워야겠다. 빗자루가 어디 있더라?' (해결 모드)", resultTypeCode: 'H' },
                            ]
                        }
                    },
                    {
                        order: 8,
                        content: '짝사랑하는 사람에게 선톡이 왔다! "주말에 뭐해?"',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-08.jpg',
                        options: {
                            create: [
                                { content: "'미쳤다 미쳤다! 나한테 관심 있나? 프사 바꿀까?' (온갖 상상의 나래)", resultTypeCode: 'S' },
                                { content: "'만나자는 건가? 토요일엔 약속 있고 일요일은 비는데.' (스케줄 확인)", resultTypeCode: 'H' },
                            ]
                        }
                    },
                    {
                        order: 9,
                        content: '엄청 슬픈 영화를 봤다. 친구들은 다 우는데 나는?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-09.jpg',
                        options: {
                            create: [
                                { content: '이미 휴지 한 통 다 썼다. 주인공 감정에 빙의됨.', resultTypeCode: 'S' },
                                { content: "'저 상황에서 저게 가능한가?' 개연성과 연기력을 분석 중이다.", resultTypeCode: 'H' },
                            ]
                        }
                    },
                    {
                        order: 10,
                        content: '누군가 나를 이유 없이 싫어한다는 걸 알게 되었을 때?',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/question-10.jpg',
                        options: {
                            create: [
                                { content: "'내가 뭘 잘못했나? 오해인가?' 신경 쓰여서 잠이 안 온다.", resultTypeCode: 'S' },
                                { content: "'어쩔 수 없지. 나도 걔 별로 안 좋아하면 됨.' (타격감 제로)", resultTypeCode: 'H' },
                            ]
                        }
                    }
                ]
            },
            results: {
                create: [
                    {
                        typeCode: 'ES',
                        title: '겉은 핵인싸, 속은 유리 멘탈',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/result-es.jpg',
                        description: '"너 진짜 쿨하다!" 라는 말 자주 듣나요? 그거 다 연기잖아요! 당신은 겉으로는 사람들과 어울리는 걸 좋아하고 리액션도 빵빵한 분위기 메이커입니다. 하지만 집에 돌아오면 "아까 그 말은 하지 말 걸 그랬나?" 하며 이불킥하는 스타일! 남들이 보기에 당신은 걱정 없어 보이지만, 사실은 누구보다 사람들의 시선과 감정에 민감해요. 겉으로 웃고 있다고 속까지 웃고 있는 건 아니랍니다. \n\n💡 나를 위한 처방: 남 눈치 그만 보고, 오늘은 제멋대로 살아보세요!'
                    },
                    {
                        typeCode: 'EH',
                        title: '브레이크 없는 쾌속 직진러',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/result-eh.jpg',
                        description: '"인생은 실전이야!" 당신의 사전엔 "후회"란 없습니다. 어디 가서 기 죽는 법이 없고, 할 말은 해야 직성이 풀리는 사이다 같은 성격! 겉으로 보이는 당당함이 속마음과 일치하는 "투명도 100%" 인간입니다. 고민할 시간에 행동하는 편이라 리더십 있다는 소리도 많이 듣죠. 하지만 가끔은 당신의 팩트 폭격에 상처받는 친구들도 ("너 티야?") 있을 수 있어요. \n\n💡 나를 위한 처방: 가끔은 빈말이라도 상대방의 기분을 맞춰주는 센스 장착하기!'
                    },
                    {
                        typeCode: 'IS',
                        title: '알면 알수록 진국, 볼매 그 자체',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/result-is.jpg',
                        description: '"첫인상은 차갑다는 오해, 지겹지 않나요? 낯을 가려서 조용히 있을 뿐인데 "화났어?"라는 말을 자주 듣습니다. 하지만 친해지면 엽기 댄스도 가능한 반전 매력의 소유자! 겉으로는 무심해 보여도 속으로는 "저 친구 물 필요하지 않을까?" 하며 세심하게 챙기고 있습니다. 상처를 받아도 티를 잘 안 내고 혼자 삭히는 편이라, 친구들은 당신이 얼마나 여린지 모를 수 있어요. \n\n💡 나를 위한 처방: 당신의 따뜻한 속마음을 조금 더 표현해 봐요. 아무도 안 잡아먹어요!'
                    },
                    {
                        typeCode: 'IH',
                        title: '조용히 세상을 지배하는 흑막(?)',
                        imageUrl: 'https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/result-ih.jpg',
                        description: '"그래서 결론이 뭔데?" 답답한 건 딱 질색! 감정 기복이 크지 않고 언제나 평정심을 유지하는 당신. 겉으로 조용한 건 낯을 가려서가 아니라, 굳이 쓸데없는 말을 섞기 귀찮아서일 수도 있습니다. 혼자서도 너무 잘 놀고, 관심 분야에는 덕후 기질도 발휘하죠. 남들이 감정에 호소할 때 당신은 머릿속으로 해결책을 내놓습니다. 차가워 보이지만 틀린 말은 안 하는 당신, 가끔 던지는 한 마디가 촌철살인이라 의외로 개그 캐릭터일지도? \n\n💡 나를 위한 처방: 세상은 효율로만 돌아가지 않아요. 가끔은 멍라니 쉬는 시간도 필요해요!'
                    }
                ]
            }
        }
    })

    console.log(`Quiz created with id: ${quiz.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
