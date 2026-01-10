import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getNavigation } from "@/lib/markdown";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "My Wiki",
  description: "A simple markdown-based wiki powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navigation = getNavigation();

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Sidebar navigation={navigation} />
        <main className="ml-64">
          {children}
        </main>
      </body>
    </html>
  );
}
