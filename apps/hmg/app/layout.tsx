import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@hchat/ui";
import { GNB } from "@hchat/ui/hmg";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "H Chat HMG",
  description: "현대자동차그룹 H Chat - 멀티 AI 어시스턴트 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuItems = [
    { label: "회사소개", href: "/" },
    { label: "사업영역", href: "/" },
    { label: "기술혁신", href: "/" },
    { label: "지속가능경영", href: "/" },
  ];

  return (
    <html lang="ko">
      <body className={inter.variable}>
        <ThemeProvider>
          <GNB brand="현대자동차그룹" menuItems={menuItems} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
