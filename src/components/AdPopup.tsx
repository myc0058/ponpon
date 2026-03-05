'use client'

import { useState, useEffect } from 'react'
import styles from './AdPopup.module.css'
import { X } from 'lucide-react'
import CoupangPartners from './CoupangPartners'

interface AdPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdPopup({ isOpen, onClose }: AdPopupProps) {
    const [adType, setAdType] = useState<'GOOGLE' | 'COUPANG'>('GOOGLE')
    const [coupangIframeSrc, setCoupangIframeSrc] = useState<string>('')

    useEffect(() => {
        if (isOpen) {
            // Randomly choose between Google and Coupang (50/50 for now)
            setAdType(Math.random() > 0.5 ? 'GOOGLE' : 'COUPANG')

            const savedIframeSrc = localStorage.getItem('coupang_iframe_src') || '';
            setCoupangIframeSrc(savedIframeSrc);

            // Prevent scrolling when popup is open
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <h3 className={styles.title}>잠시만요!</h3>
                    <p className={styles.subtitle}>관심 있을 만한 정보를 확인해보세요</p>
                </div>

                <div className={styles.adWrapper}>
                    {adType === 'GOOGLE' ? (
                        <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                            <p>구글 애드센스</p>
                            <p>전면 광고 영역</p>
                            <ins className="adsbygoogle"
                                style={{ display: 'block' }}
                                data-ad-client="ca-pub-9702335674400881"
                                data-ad-slot="YOUR_POPUP_SLOT_ID"
                                data-ad-format="auto"
                                data-full-width-responsive="true"></ins>
                        </div>
                    ) : (
                        <CoupangPartners iframeSrc={coupangIframeSrc} />
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.continueButton} onClick={onClose}>
                        닫고 계속하기
                    </button>
                </div>
            </div>
        </div>
    )
}
