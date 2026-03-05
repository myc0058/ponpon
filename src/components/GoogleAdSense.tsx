'use client';

import Script from 'next/script';

export default function GoogleAdSense() {
    return (
        <Script
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9702335674400881"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
        />
    );
}