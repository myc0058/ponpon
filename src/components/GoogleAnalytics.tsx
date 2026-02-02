'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Script from 'next/script'

function AnalyticsContent() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const GA_TRACKING_ID = 'G-RRJNBF781Z'

    useEffect(() => {
        if (pathname && window.gtag) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '')
            window.gtag('config', GA_TRACKING_ID, {
                page_path: url,
            })
        }
    }, [pathname, searchParams])

    return null
}

export default function GoogleAnalytics() {
    const GA_TRACKING_ID = 'G-RRJNBF781Z'

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_TRACKING_ID}');
        `}
            </Script>
            <Suspense fallback={null}>
                <AnalyticsContent />
            </Suspense>
        </>
    )
}

declare global {
    interface Window {
        dataLayer: any[]
        gtag: (...args: any[]) => void
    }
}
