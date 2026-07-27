import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistema PAEC",
  description: "Gestión Escolar y de Proyectos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
        <Script
          id="bfcache-checker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function checkBFCache() {
                if (!document.cookie.includes('is_logged_in=')) {
                   if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                     window.location.replace('/login');
                   }
                }
              }

              window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                  window.location.reload();
                }
              });

              window.addEventListener('popstate', checkBFCache);
              window.addEventListener('focus', checkBFCache);
            `,
          }}
        />
      </body>
    </html>
  );
}

