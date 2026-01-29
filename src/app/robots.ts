import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/admin/', // 관리자 페이지는 크롤링 방지
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
