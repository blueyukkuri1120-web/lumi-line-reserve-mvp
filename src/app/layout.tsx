import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import { LiffBootstrap } from "@/components/liff-bootstrap";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Lumi Line Reserve MVP",
  description: "LINEから予約・確認・変更・キャンセルができる一人サロン向け予約導線MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body className="antialiased">
        <Suspense fallback={null}>
          <LiffBootstrap />
        </Suspense>
        {children}
      </body>
      <Script src="https://static.line-scdn.net/liff/edge/2/sdk.js" strategy="afterInteractive" />
    </html>
  );
}
