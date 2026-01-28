import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "폰폰 (PonPon) - 전설의 테스트",
  description: "당신을 닮은 전설의 존재를 찾아보세요. 가장 정밀한 성향 분석 퀴즈 플랫폼, 폰폰.",
  openGraph: {
    title: "폰폰 (PonPon) - 전설의 테스트",
    description: "당신을 닮은 전설의 존재를 찾아보세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
