import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://ponpon.factorization.co.kr'),
  title: "폰폰 (PonPon) - 전설의 테스트",
  description: "당신을 닮은 전설의 존재를 찾아보세요. 가장 정밀한 성향 분석 퀴즈 플랫폼, 폰폰.",
  openGraph: {
    title: "폰폰 (PonPon) - 전설의 테스트",
    description: "당신을 닮은 전설의 존재를 찾아보세요.",
    type: "website",
    locale: "ko_KR",
  },
};

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: '폰폰 (PonPon)',
              url: 'https://ponpon.factorization.co.kr', // Replace with actual URL if known, assuming deployment URL
              description: '당신을 닮은 전설의 존재를 찾아보세요. 가장 정밀한 성향 분석 퀴즈 플랫폼',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://ponpon.factorization.co.kr/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        <Header />
        {children}
      </body>
    </html>
  );
}
