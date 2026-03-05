'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import QuizGrid from '@/components/QuizGrid'
import styles from './result.module.css'
import { Share2, Home, Lock, Link as LinkIcon, RotateCcw } from 'lucide-react'
import { generateShortUrl } from '@/app/actions/shorten-url'
import ShareDrawer from '@/components/ShareDrawer'
import CoupangPartners from '@/components/CoupangPartners'
import { getBustedImageUrl } from '@/lib/image-utils'
import { useToast } from '@/components/Toast'
import { formatContent } from '@/lib/string-utils'
import ReportModal from '@/components/ReportModal'
import { Flag } from 'lucide-react'


type Result = {
    id: string
    title: string
    description: string
    imageUrl: string | null
    isPremium: boolean
}

type Quiz = {
    id: string
    title: string
}

export default function ResultDisplay({
    quiz,
    result,
    score,
    resultType,
    typeCode,
    compressedData,
    recommendedQuizzes = []
}: {
    quiz: Quiz
    result: Result
    score: number
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    typeCode?: string
    compressedData: string
    recommendedQuizzes?: any[]
}) {
    const [isPaid, setIsPaid] = useState(false)
    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)
    const [isReportOpen, setIsReportOpen] = useState(false)


    const handlePayment = async () => {
        setIsPaymentLoading(true)
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', {
                content_name: 'Premium Result',
                content_category: 'Quiz',
                value: 1000,
                currency: 'KRW'
            })
        }
        setTimeout(() => {
            setIsPaid(true)
            setIsPaymentLoading(false)
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('track', 'Purchase', {
                    value: 1000,
                    currency: 'KRW'
                })
            }
        }, 1500)
    }

    const [shortUrl, setShortUrl] = useState<string>('')

    useEffect(() => {
        const fetchShortUrl = async () => {
            try {
                // 압축된 데이터를 포함한 절대 경로 생성
                const sharePath = `/quiz/${quiz.id}/result?o=${compressedData}`
                const fullUrl = `${window.location.origin}${sharePath}`

                const res = await generateShortUrl(fullUrl)
                if (res.success) {
                    setShortUrl(`${window.location.origin}/s/${res.id}`)
                } else {
                    setShortUrl(fullUrl)
                }
            } catch (e) {
                console.error('Failed to shorten URL:', e)
                setShortUrl(window.location.href)
            }
        }
        fetchShortUrl()
        window.scrollTo({ top: 0, behavior: 'smooth' })

        // Track Quiz Result View
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'ViewContent', {
                content_name: result.title,
                content_category: 'Quiz Result',
                content_ids: [result.id],
                value: 0,
                currency: 'KRW'
            })
        }
    }, [compressedData, quiz.id])

    const { showToast } = useToast()

    const handleShare = async (platform: string) => {
        showToast('아직 준비 중인 기능입니다. 링크 복사 버튼을 눌러서 공유해주세요!', 'info')
    }

    const handleCopyLink = async () => {
        try {
            const url = shortUrl || window.location.href
            await navigator.clipboard.writeText(url)
            showToast('링크가 복사되었습니다! 친구와의 대화창이나 SNS에 붙여넣어 내 결과를 뽐내보세요!', 'success')
        } catch (err) {
            console.error('Failed to copy: ', err)
            showToast('링크 복사에 실패했습니다.', 'error')
        }
    }



    const showPremiumLock = result.isPremium && !isPaid

    return (
        <main className={styles.container}>
            <div className={styles.resultCard}>
                <div className={styles.header}>
                    <h3 className={styles.quizTitle}>{quiz.title}</h3>
                    <div className={styles.scoreDisplay}>
                        {resultType === 'TYPE_BASED' ? `나의 타입: ${typeCode || 'N/A'}` : `나의 점수: ${score}점`}
                    </div>
                </div>

                {showPremiumLock ? (
                    <div className={styles.premiumLock}>
                        <Lock size={48} className={styles.lockIcon} />
                        <h2 className={styles.lockTitle}>프리미엄 결과</h2>
                        <p className={styles.lockDescription}>
                            이 결과를 보려면 결제가 필요합니다.
                        </p>
                        <button
                            className={styles.payButton}
                            onClick={handlePayment}
                            disabled={isPaymentLoading}
                        >
                            {isPaymentLoading ? '처리 중...' : '1,000원에 결과 보기'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div id="result-content">
                            {result.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={getBustedImageUrl(result.imageUrl)}
                                    alt={result.title}
                                    className={styles.resultImage}
                                />
                            )}

                            <div className={styles.content}>
                                <h1 className={styles.resultTitle}>{result.title}</h1>
                                <p className={styles.resultDescription}>{formatContent(result.description)}</p>
                            </div>
                        </div>

                        <div className={styles.shareSection}>
                            <h3 className={styles.shareTitle}>
                                <Share2 size={20} />
                                결과 공유하기
                            </h3>
                            <div className={styles.actionButtons}>
                                <button
                                    className={`${styles.actionButton} ${styles.shareButton}`}
                                    onClick={() => setIsShareOpen(true)}
                                >
                                    <Share2 size={24} />
                                    공유하기
                                </button>
                                <Link href={`/quiz/${quiz.id}`} className={`${styles.actionButton} ${styles.retryButton}`}>
                                    <RotateCcw size={24} />
                                    다시하기
                                </Link>
                            </div>
                        </div>
                    </>
                )}

                <Link href="/" className={styles.homeButton}>
                    <Home size={20} />
                    홈으로 돌아가기
                </Link>

                <button
                    className={styles.reportButton}
                    onClick={() => setIsReportOpen(true)}
                >
                    <Flag size={14} />
                    결과에 문제가 있나요? 신고하기
                </button>
            </div>

            {/* <CoupangPartners iframeSrc="여기에_쿠팡에서_복사한_주소_붙여넣기" /> */}

            {/* 구글 애드센스 - 결과와 추천 사이 (숨김 처리) */}
            {/* 
            <div style={{ margin: '2rem 0', minHeight: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666', width: '100%' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <p style={{ margin: '5px 0' }}>구글 애드센스 (중간 배너)</p>
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-9702335674400881"
                        data-ad-slot="RESULT_MIDDLE_SLOT"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                </div>
            </div>
            */}

            {recommendedQuizzes && recommendedQuizzes.length > 0 && (
                <div style={{ width: '100%', marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '1.5rem', textAlign: 'center' }}>다른 테스트 더보기</h2>
                    <QuizGrid quizzes={recommendedQuizzes} />
                </div>
            )}

            {/* 하단 여백 추가용 투명 요소 */}
            <div style={{ height: '3rem' }}></div>

            <ShareDrawer
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                onShare={handleShare}
                onCopy={handleCopyLink}
                title={result.title}
                description={result.description}
                imageUrl={getBustedImageUrl(result.imageUrl)}
            />

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                quizId={quiz.id}
                resultId={result.id}
            />
        </main>

    )
}
