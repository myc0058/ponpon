'use client'

import styles from './CoupangPartners.module.css'
import { ShoppingCart } from 'lucide-react'

interface ProductLink {
    title: string;
    price: string;
    imageUrl: string;
    linkUrl: string;
    weight: number; // 노출 가중치 (높을수록 자주 노출)
}

const DYNAMIC_BANNER_WEIGHT = 10; // 다이내믹 배너 가중치

const DEFAULT_PRODUCTS: ProductLink[] = [
    {
        title: "Apple 2024 맥북 에어 13 M3, 실버, 8코어 GPU, 256GB, 8GB, 한글",
        price: "1,358,000원",
        imageUrl: "https://thumbnail8.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2024/03/12/10/7/96c7a106-9b57-4b77-a859-e93540c94622.jpg",
        linkUrl: "https://link.coupang.com/a/bYWXTo",
        weight: 5
    },
    {
        title: "삼성전자 갤럭시 S24 Ultra 자급제 256GB, 티타늄 그레이",
        price: "1,460,000원",
        imageUrl: "https://thumbnail10.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2024/01/18/10/8/0e6c5148-5c4e-4f5b-9d4e-1463e2776c53.jpg",
        linkUrl: "https://link.coupang.com/a/bYWXW8",
        weight: 5
    },
    {
        title: "소니 정품 WH-1000XM5 노이즈 캔슬링 블루투스 헤드셋, 블랙",
        price: "379,000원",
        imageUrl: "https://thumbnail8.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2022/06/07/11/5/cfae4f8a-40a2-4638-9562-b91176b91118.jpg",
        linkUrl: "https://link.coupang.com/a/bYWX0S",
        weight: 3
    },
    {
        title: "닌텐도 스위치 OLED 모델, 화이트",
        price: "365,000원",
        imageUrl: "https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/2021/10/05/17/8/4f179c3d-bd8a-4c2c-a0e2-6a84d4361eb2.jpg",
        linkUrl: "https://link.coupang.com/a/bYWX26",
        weight: 3
    }
]

interface CoupangPartnersProps {
    iframeSrc?: string;
}

export default function CoupangPartners({ iframeSrc }: CoupangPartnersProps) {
    // Weighted Random Selection Logic
    const getTotalWeight = () => {
        let total = iframeSrc ? DYNAMIC_BANNER_WEIGHT : 0;
        DEFAULT_PRODUCTS.forEach(p => total += p.weight);
        return total;
    };

    const getSelectedItem = () => {
        const totalWeight = getTotalWeight();
        let random = Math.random() * totalWeight;

        // Check Dynamic Banner first
        if (iframeSrc && random < DYNAMIC_BANNER_WEIGHT) {
            return { type: 'DYNAMIC' as const };
        }

        if (iframeSrc) random -= DYNAMIC_BANNER_WEIGHT;

        // Check Products
        for (const product of DEFAULT_PRODUCTS) {
            if (random < product.weight) {
                return { type: 'PRODUCT' as const, data: product };
            }
            random -= product.weight;
        }

        return { type: 'PRODUCT' as const, data: DEFAULT_PRODUCTS[0] };
    };

    const selected = getSelectedItem();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <ShoppingCart size={18} />
                <span>당신을 위한 추천 상품</span>
            </div>
            <div className={styles.bannerWrapper}>
                {selected.type === 'DYNAMIC' && iframeSrc ? (
                    <iframe
                        src={iframeSrc}
                        width="100%"
                        height="100"
                        frameBorder="0"
                        scrolling="no"
                        referrerPolicy="unsafe-url"
                    />
                ) : (
                    <a
                        href={(selected.data as ProductLink).linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.productCard}
                    >
                        <img
                            src={(selected.data as ProductLink).imageUrl}
                            alt={(selected.data as ProductLink).title}
                            className={styles.productImage}
                        />
                        <div className={styles.productInfo}>
                            <h4 className={styles.productTitle}>{(selected.data as ProductLink).title}</h4>
                            <span className={styles.productPrice}>{(selected.data as ProductLink).price}</span>
                        </div>
                        <div className={styles.buyButton}>보러가기</div>
                    </a>
                )}
            </div>
            <p className={styles.disclaimer}>
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    )
}
