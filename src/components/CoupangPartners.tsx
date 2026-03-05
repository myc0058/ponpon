'use client'

import styles from './CoupangPartners.module.css'
import { ShoppingCart } from 'lucide-react'

interface CoupangPartnersProps {
    iframeSrc?: string;
}

export default function CoupangPartners({ iframeSrc }: CoupangPartnersProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ShoppingCart size={18} />
                <span>당신을 위한 추천 상품</span>
            </div>
            <div className={styles.bannerWrapper}>
                {iframeSrc ? (
                    <iframe
                        src={iframeSrc}
                        width="100%"
                        height="100"
                        frameBorder="0"
                        scrolling="no"
                        referrerPolicy="unsafe-url"
                    />
                ) : (
                    <div className={styles.placeholderBanner}>
                        <p>쿠팡 파트너스 다이내믹 배너 또는 상품 링크가 여기에 표시됩니다.</p>
                        <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>
                            (관리자 페이지나 결과 페이지에서 코드를 넣어주세요)
                        </p>
                    </div>
                )}
            </div>
            <p className={styles.disclaimer}>
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    )
}
