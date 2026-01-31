import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // 파라미터 추출
        const hasTitle = searchParams.has('title')
        const title = hasTitle
            ? searchParams.get('title')?.slice(0, 100)
            : '나의 결과는?'
        const description = searchParams.get('description')?.slice(0, 100) || '퀴즈 결과를 확인해보세요!'
        const quizTitle = searchParams.get('quizTitle')?.slice(0, 100) || 'FonFon Quiz'
        const imageUrl = searchParams.get('imageUrl')

        const type = searchParams.get('type')

        // 결과 페이지용 이미지 생성 (텍스트 없이 이미지만 강조)
        if (type === 'result' && imageUrl) {
            return new ImageResponse(
                (
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                    >
                        {/* 배경 장식 (선택사항, 단순함을 위해 생략 가능 하지만 깊이감을 위해 추가) */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                            }}
                        />

                        <img
                            src={imageUrl}
                            alt="Result"
                            height="630"
                            style={{
                                height: '100%',
                                width: 'auto',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.4))', // 그림자 효과로 깊이감 추가
                            }}
                        />
                    </div>
                ),
                {
                    width: 1200,
                    height: 630,
                }
            )
        }

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '40px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            borderRadius: '20px',
                            padding: '40px',
                            width: '90%',
                            height: '85%',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                        }}
                    >
                        {/* 퀴즈 타이틀 (상단 태그) */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 24,
                                color: '#6d28d9', // purple-700
                                marginBottom: 20,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                            }}
                        >
                            {quizTitle}
                        </div>

                        {/* 결과 이미지 (있을 경우) */}
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Result"
                                width="200"
                                height="200"
                                style={{
                                    borderRadius: '15px',
                                    marginBottom: 20,
                                    objectFit: 'cover',
                                }}
                            />
                        )}

                        {/* 메인 타이틀 */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 60,
                                fontWeight: 900,
                                color: '#1f2937', // gray-800
                                textAlign: 'center',
                                marginBottom: 20,
                                lineHeight: 1.1,
                            }}
                        >
                            {title}
                        </div>

                        {/* 설명 */}
                        <div
                            style={{
                                display: 'flex',
                                fontSize: 30,
                                color: '#4b5563', // gray-600
                                textAlign: 'center',
                                maxWidth: '80%',
                                lineHeight: 1.4,
                            }}
                        >
                            {description}
                        </div>
                    </div>
                    {/* 하단 브랜딩 */}
                    <div
                        style={{
                            display: 'flex',
                            position: 'absolute',
                            bottom: 20,
                            fontSize: 20,
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontWeight: 600,
                        }}
                    >
                        ponpon.factorization.co.kr
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}
