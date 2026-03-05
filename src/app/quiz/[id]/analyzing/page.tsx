'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './analyzing.module.css'
import CoupangPartners from '@/components/CoupangPartners'

export default function AnalyzingPage({ params }: { params: Promise<{ id: string }> }) {
    const [progress, setProgress] = useState(0)
    const [showResultButton, setShowResultButton] = useState(false)
    const [finalUrl, setFinalUrl] = useState('')
    const router = useRouter()
    const [quizId, setQuizId] = useState<string>('')
    const [coupangIframeSrc, setCoupangIframeSrc] = useState<string>('')

    useEffect(() => {
        params.then(p => setQuizId(p.id))

        // Retrieve coupang iframe src from potential location or default
        // In a real app, this might come from CMS or environment
        const savedIframeSrc = localStorage.getItem('coupang_iframe_src') || '';
        setCoupangIframeSrc(savedIframeSrc);
    }, [params])

    useEffect(() => {
        if (!quizId) return

        const storedResult = sessionStorage.getItem(`quiz_result_${quizId}`)

        if (!storedResult) {
            router.replace(`/quiz/${quizId}`)
            return
        }

        try {
            const resultData = JSON.parse(storedResult)

            // Construct Final URL
            if (resultData.type === 'SCORE') {
                setFinalUrl(`/quiz/${quizId}/result?score=${resultData.score}`)
            } else if (resultData.type === 'TYPE') {
                setFinalUrl(`/quiz/${quizId}/result?type=${resultData.resultType}`)
            } else {
                // Invalid data
                router.replace(`/quiz/${quizId}`)
                return
            }

            // Start animation
            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        setShowResultButton(true)
                        return 100
                    }
                    return Math.min(100, prev + 1)
                })
            }, 30) // 3 seconds approx (100 * 30ms = 3000ms)

            return () => clearInterval(timer)

        } catch (e) {
            console.error(e)
            router.replace(`/quiz/${quizId}`)
        }

    }, [quizId, router])

    if (!quizId) return null

    return (
        <main className={styles.container}>
            {/* 구글 애드센스 - 분석 상단 */}
            <div style={{ marginBottom: '1.5rem', minHeight: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666', width: '100%' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <p style={{ margin: '5px 0' }}>구글 애드센스 (상단 배너)</p>
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-9702335674400881"
                        data-ad-slot="ANALYZING_TOP_SLOT"
                        data-ad-format="horizontal"
                        data-full-width-responsive="true"></ins>
                </div>
            </div>

            <div className={styles.questionCard}>
                <h2 className={styles.calculatingTitle}>
                    {showResultButton ? '분석이 완료되었습니다!' : '데이터를 정밀 분석 중...'}
                </h2>

                <div className={styles.calculatingProgress}>
                    <div
                        className={styles.calculatingBar}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className={styles.calculatingText}>{Math.floor(progress)}% 완료</p>

                {/* 하단 광고 샌드위치 영역 */}
                <div style={{ marginTop: '2.5rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* 샌드위치 1: 쿠팡 파트너스 (버튼 위) */}
                    <CoupangPartners iframeSrc={coupangIframeSrc} />

                    {showResultButton && (
                        <button
                            className={styles.resultButton}
                            onClick={() => router.push(finalUrl)}
                            style={{ margin: '0' }}
                        >
                            결과 확인하기
                        </button>
                    )}

                    {/* 샌드위치 2: 구글 애드센스 (버튼 아래) */}
                    <div style={{ minHeight: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666' }}>
                        <div style={{ textAlign: 'center', width: '100%' }}>
                            <p style={{ margin: '5px 0' }}>구글 애드센스 (버튼 하단)</p>
                            <ins className="adsbygoogle"
                                style={{ display: 'block' }}
                                data-ad-client="ca-pub-9702335674400881"
                                data-ad-slot="ANALYZING_BOTTOM_SLOT"
                                data-ad-format="auto"
                                data-full-width-responsive="true"></ins>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
