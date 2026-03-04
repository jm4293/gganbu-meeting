import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "깐부회동",
  description: "깐부회동 퍼센트",
  keywords: [
    "깐부회동",
    "깐부",
    "깐부회동 퍼센트",
    "깐부회동 엔비디아",
    "깐부회동 삼전",
    "깐부회동 삼성전자",
    "깐부회동 현차",
    "깐부회동 현대차",
    "깐부회동 엔비",
    "깐부 주가",
    "깐부 화상 회의",
    "실시간 주가 화상 미팅",
    "주식 퍼센트 실시간",
    "삼성전자 주가",
    "엔비디아 주가",
    "현대차 주가",
    "화상 회의",
    "gganbu meeting",
  ],
  authors: [{ name: "Gganbu Team" }],
  creator: "Gganbu Team",
  metadataBase: new URL("https://gganbu-meeting.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "깐부회동",
    description: "깐부회동 퍼센트",
    url: "https://gganbu-meeting.vercel.app",
    siteName: "깐부회동",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "깐부회동",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "깐부회동",
    description: "깐부회동 퍼센트",
    images: ["/preview.png"],
  },
  verification: {
    google: "E9zDQXXuO2_eJB1WprGOEvaTHyUcMq4UaaObuOfTY5E",
  },
  icons: {
    icon: "/favicon.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "깐부회동",
  alternateName: ["깐부 회동", "Gganbu Meeting", "gganbu-meeting"],
  url: "https://gganbu-meeting.vercel.app",
  description: "깐부회동 퍼센트",
  applicationCategory: "CommunicationApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  keywords:
    "깐부회동, 깐부, 깐부회동 퍼센트, 깐부회동 엔비디아, 깐부회동 삼전, 깐부회동 현차, 깐부회동 현대차, 깐부회동 엔비",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
