import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "EAI Hub — Платформа внедрения AI в Тайпит",
  description: "Конкурс идей по внедрению Enterprise AI в холдинге Тайпит. Истории успеха, ресурсы, форум для сотрудников.",
  keywords: "AI, искусственный интеллект, Тайпит, конкурс, автоматизация, Claude, GPT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
