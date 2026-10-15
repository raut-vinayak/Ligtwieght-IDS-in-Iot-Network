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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <Script src="/ort/ort.min.js" strategy="beforeInteractive" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('ids_theme');
                if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="h-full bg-canvas text-ink antialiased overflow-hidden transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
