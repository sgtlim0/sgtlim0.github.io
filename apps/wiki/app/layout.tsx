import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeProvider from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "H Chat Wiki",
  description: "현대차그룹 생성형 AI 서비스 H Chat 사용 가이드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans`}>
        <ThemeProvider>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded">본문 바로가기</a>
          <Sidebar />
          <main id="main-content" className="ml-[280px] h-screen overflow-hidden">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
