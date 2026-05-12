// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeScript } from "@/components/layout/ThemeScript";

export const metadata: Metadata = {
  title: "NGramLab — Interactive 4-Gram Language Model Demo",
  description:
    "Train, tune, evaluate, and generate text with two 4-gram language models — backoff and interpolation with add-k smoothing. M-DAS Mini Project 1.",
  keywords: [
    "NLP",
    "n-gram",
    "language model",
    "backoff",
    "interpolation",
    "perplexity",
    "text generation",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
