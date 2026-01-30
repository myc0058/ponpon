'use client'

import React, { useEffect } from 'react'
import styles from './ShareDrawer.module.css'
import { X, Link, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { getBustedImageUrl } from '@/lib/image-utils'

interface ShareDrawerProps {
    isOpen: boolean
    onClose: () => void
    onShare: (platform: string) => void
    onCopy: () => void
    title: string
    description: string
    imageUrl: string | null
}

export default function ShareDrawer({
    isOpen,
    onClose,
    onShare,
    onCopy,
    title,
    description,
    imageUrl
}: ShareDrawerProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>공유하기</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.previewCard}>
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={getBustedImageUrl(imageUrl)} alt={title} className={styles.previewImage} />
                    ) : (
                        <div className={styles.previewImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            No Image
                        </div>
                    )}
                    <div className={styles.previewContent}>
                        <h4 className={styles.previewTitle}>{title}</h4>
                        <p className={styles.previewDescription}>{description}</p>
                    </div>
                </div>

                <div className={styles.shareGrid}>
                    <button className={styles.shareItem} onClick={() => onShare('kakao')}>
                        <div className={`${styles.iconWrapper} ${styles.kakao}`}>
                            <MessageCircle size={24} />
                        </div>
                        <span>카카오톡</span>
                    </button>

                    <button className={styles.shareItem} onClick={() => onShare('facebook')}>
                        <div className={`${styles.iconWrapper} ${styles.facebook}`}>
                            <Facebook size={24} />
                        </div>
                        <span>페이스북</span>
                    </button>

                    <button className={styles.shareItem} onClick={() => onShare('twitter')}>
                        <div className={`${styles.iconWrapper} ${styles.twitter}`}>
                            <Twitter size={24} />
                        </div>
                        <span>트위터</span>
                    </button>

                    <button className={styles.shareItem} onClick={onCopy}>
                        <div className={`${styles.iconWrapper} ${styles.copy}`}>
                            <Link size={24} />
                        </div>
                        <span>링크복사</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
