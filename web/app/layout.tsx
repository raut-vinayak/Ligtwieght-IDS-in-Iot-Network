import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lightweight IoT IDS — Research & Benchmarking Dashboard",
  description: "Resource-constrained Machine Learning Intrusion Detection System evaluated on CICIoT2023 flow dataset.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script src="/ort/ort.min.js" strategy="beforeInteractive" />
      </head>
      <body className="h-full bg-canvas text-ink antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
