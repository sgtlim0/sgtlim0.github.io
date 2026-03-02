import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ThemeToggle } from "@hchat/ui";
import { GNB } from "@hchat/ui/hmg";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "H Chat - 현대자동차그룹",
    template: "%s | H Chat HMG",
  },
  description: "현대자동차그룹 H Chat - 멀티 AI 어시스턴트 플랫폼. 업무 생산성을 혁신하는 AI 채팅 서비스.",
  keywords: ["H Chat", "현대자동차그룹", "AI", "멀티 AI", "어시스턴트", "생산성"],
  openGraph: {
    title: "H Chat - 현대자동차그룹",
    description: "현대자동차그룹 H Chat - 멀티 AI 어시스턴트 플랫폼",
    type: "website",
    locale: "ko_KR",
    url: "https://hchat-hmg.vercel.app",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = [
    { label: "서비스 소개", href: "/" },
    { label: "사용 가이드", href: "/guide" },
    { label: "대시보드", href: "/dashboard" },
    { label: "자료실", href: "/publications" },
  ];

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <GNB brand="현대자동차그룹" menuItems={menuItems} rightSlot={<ThemeToggle />} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
