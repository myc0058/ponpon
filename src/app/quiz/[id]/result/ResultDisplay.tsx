'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './result.module.css'
import { Share2, Home, Lock, Link as LinkIcon, RotateCcw } from 'lucide-react'
import { generateShortUrl } from '@/app/actions/shorten-url'
import ShareDrawer from '@/components/ShareDrawer'

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
    typeCode
}: {
    quiz: Quiz
    result: Result
    score: number
    resultType: 'SCORE_BASED' | 'TYPE_BASED'
    typeCode?: string
}) {
    const [isPaid, setIsPaid] = useState(false)
    const [isPaymentLoading, setIsPaymentLoading] = useState(false)
    const [isShareOpen, setIsShareOpen] = useState(false)

    const handlePayment = async () => {
        setIsPaymentLoading(true)
        setTimeout(() => {
            setIsPaid(true)
            setIsPaymentLoading(false)
        }, 1500)
    }

    const [shortUrl, setShortUrl] = useState<string>('')

    useEffect(() => {
        const fetchShortUrl = async () => {
            try {
                const currentUrl = window.location.href
                const result = await generateShortUrl(currentUrl)
                if (result.success) {
                    setShortUrl(`${window.location.origin}/s/${result.id}`)
                } else {
                    setShortUrl(currentUrl)
                }
            } catch (e) {
                console.error('Failed to shorten URL:', e)
                setShortUrl(window.location.href)
            }
        }
        fetchShortUrl()
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const handleShare = async (platform: string) => {
        const url = shortUrl || window.location.href
        const text = `나는 "${quiz.title}" 퀴즈에서 "${result.title}" 결과가 나왔어요!`

        switch (platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
                break
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
                break
            case 'kakao':
                alert('카카오톡 공유 기능은 준비 중입니다.')
                break
        }
    }

    const handleCopyLink = async () => {
        try {
            const url = shortUrl || window.location.href
            await navigator.clipboard.writeText(url)
            alert('단축 링크가 클립보드에 복사되었습니다!')
        } catch (err) {
            console.error('Failed to copy: ', err)
            alert('링크 복사에 실패했습니다.')
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
                                    src={result.imageUrl}
                                    alt={result.title}
                                    className={styles.resultImage}
                                />
                            )}

                            <div className={styles.content}>
                                <h1 className={styles.resultTitle}>{result.title}</h1>
                                <p className={styles.resultDescription}>{result.description}</p>
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
            </div>

            <div className={styles.adPlaceholder}>
                <div className={styles.adLabel}>광고</div>
                <div className={styles.adContent}>Google AdSense 영역</div>
            </div>

            <ShareDrawer
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                onShare={handleShare}
                onCopy={handleCopyLink}
                title={result.title}
                description={result.description}
                imageUrl={result.imageUrl}
            />
        </main>
    )
}
