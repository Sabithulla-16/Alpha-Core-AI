import type { Metadata, Viewport } from "next";
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
  title: "Alpha Core V5.0 - AI Intelligence Platform",
  description: "Advanced AI chat interface with multi-model support, OCR capabilities, and lightning-fast reasoning. Experience next-generation AI intelligence.",
  keywords: ["AI", "Chat", "Machine Learning", "OCR", "GGUF", "LLM", "Artificial Intelligence"],
  authors: [{ name: "Alpha Core Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Alpha Core",
  },
  openGraph: {
    type: "website",
    title: "Alpha Core V5.0",
    description: "Advanced AI Intelligence Platform",
    siteName: "Alpha Core",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha Core V5.0",
    description: "Advanced AI Intelligence Platform",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
