'use client'

import { useState, useEffect } from 'react'
import { Share2, Link as LinkIcon, X } from 'lucide-react'
import styles from './quiz.module.css'
import { generateShortUrl } from '@/app/actions/shorten-url'

type Quiz = {
    id: string
    title: string
    description: string
    imageUrl: string | null
}

export default function QuizShareUI({ quiz }: { quiz: Quiz }) {
    const [showShare, setShowShare] = useState(false)
    const [shortUrl, setShortUrl] = useState<string>('')

    useEffect(() => {
        if (showShare && !shortUrl) {
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
        }
    }, [showShare, shortUrl])

    const handleShare = async (platform: string) => {
        const url = shortUrl || window.location.href
        const text = `이 퀴즈 한번 풀어보세요! "${quiz.title}"`

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

    return (
        <>
            <button
                className={styles.secondaryButton}
                onClick={() => setShowShare(true)}
            >
                <Share2 size={24} />
                공유하기
            </button>

            {showShare && (
                <div className={styles.shareOverlay} onClick={() => setShowShare(false)}>
                    <div className={styles.shareModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.shareHeader}>
                            <h3 className={styles.shareTitle} style={{ marginBottom: 0 }}>
                                <Share2 size={18} />
                                친구에게 공유하기
                            </h3>
                            <button className={styles.closeButton} onClick={() => setShowShare(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className={styles.shareButtons}>
                            <button className={`${styles.shareButton} ${styles.kakao}`} onClick={() => handleShare('kakao')}>
                                카카오톡
                            </button>
                            <button className={`${styles.shareButton} ${styles.facebook}`} onClick={() => handleShare('facebook')}>
                                페이스북
                            </button>
                            <button className={`${styles.shareButton} ${styles.twitter}`} onClick={() => handleShare('twitter')}>
                                트위터
                            </button>
                            <button className={`${styles.shareButton} ${styles.copy}`} onClick={handleCopyLink}>
                                <LinkIcon size={14} style={{ marginRight: '4px' }} />
                                링크복사
                            </button>
                        </div>

                        <div className={styles.previewCard}>
                            <div className={styles.previewLabel}>공유 미리보기</div>
                            <div className={styles.previewContent}>
                                {quiz.imageUrl && (
                                    <img src={quiz.imageUrl} alt="Preview" className={styles.previewThumb} />
                                )}
                                <div className={styles.previewInfo}>
                                    <div className={styles.previewTitle}>{quiz.title}</div>
                                    <div className={styles.previewDesc}>{quiz.description}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
