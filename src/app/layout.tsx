import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'),
  title: "폰폰(PonPon) | 심리테스트, 운세, MBTI 분석을 한곳에!",
  description: "심심할 땐 폰폰(PonPon)! 소름 돋는 심리테스트와 MBTI 분석은 기본, 매일 확인하는 재미있는 운세 서비스까지. 당신의 매력을 폰폰에서 확인하세요.",
  keywords: "폰폰, PonPon, 심심, mbti, 성격 테스트, 심리 테스트, 무료 테스트, 성격유형검사, 연애, 연애 테스트, 엠비티아이, 궁합, 오늘의 운세, 성격 진단, 퀴즈, 사주, 타로, 신년운세, 토정비결, 운세 맛집, 심심풀이, 최신 심리 테스트, 테스트모음, 심테추천, 테스트 사이트, 심리 테스트 사이트, 연애 심리, 감정, 유형 검사, 자기이해, 추천 테스트, 요즘 유행, 트렌드, SNS 심리, 요즘 인기, 소름 돋는, 정확한 테스트, 취향 분석, 자가진단, 운세 무료, 무료 운세 사이트",
  openGraph: {
    title: "폰폰(PonPon) | 심리테스트부터 MBTI, 운세까지!",
    description: "내 성격 분석부터 오늘의 행운까지! 폰폰에서 다양한 심리테스트와 운세를 무료로 즐겨보세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "PonPon",
    images: [
      {
        url: "https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/og/default.webp?v=1",
        width: 1200,
        height: 630,
        alt: "폰폰(PonPon) - 심리테스트와 운세를 즐기는 종합 놀이터",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "폰폰(PonPon) | 심리테스트부터 MBTI, 운세까지!",
    description: "내 성격 분석부터 오늘의 행운까지! 폰폰에서 다양한 심리테스트와 운세를 무료로 즐겨보세요.",
    images: ["https://ngpkpjqdwffgxocrakae.supabase.co/storage/v1/object/public/quiz-images/og/default.webp?v=1"],
  },
};

import GoogleAnalytics from "@/components/GoogleAnalytics";
import Header from "@/components/Header";
import { ToastProvider } from "@/components/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '폰폰 (PonPon)',
              url: 'https://ponpon.factorization.co.kr',
              description: '심심할 땐 폰폰(PonPon)! 소름 돋는 심리테스트와 MBTI 분석, 운세를 무료로 즐겨보세요.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://ponpon.factorization.co.kr/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <ToastProvider>
          <div className="app-wrapper">
            <Header />
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
