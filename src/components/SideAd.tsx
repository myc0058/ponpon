'use client'

import styles from './SideAd.module.css'

interface SideAdProps {
    position: 'left' | 'right';
    slotId?: string;
}

export default function SideAd({ position, slotId }: SideAdProps) {
    return (
        <div className={`${styles.sideAdContainer} ${styles[position]}`}>
            {/* 구글 애드센스 광고 영역 */}
            <div className={styles.placeholder}>
                {slotId ? (
                    <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-9702335674400881"
                        data-ad-slot={slotId}
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                ) : (
                    <>
                        <p>애드센스 사이드바</p>
                        <p>({position === 'left' ? '좌' : '우'})</p>
                    </>
                )}
            </div>
        </div>
    )
}
