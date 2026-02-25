import type { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { TopBar } from "@/components/top-bar";
import { BackToTop } from "@/components/back-to-top";
import { LenisProvider } from "@/components/lenis-provider";
import { WebVitals } from "@/components/analytics/web-vitals";
import NextTopLoader from "nextjs-toploader";
import { getDictionary } from "./dictionaries";
import "../globals.css";
import Script from "next/script";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-markdown-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-markdown-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Léon Zhang - Software Engineer & Tech Writer",
    template: "%s | Léon Zhang",
  },
  description:
    "Software Engineer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
  keywords: [
    "Software Engineer",
    "Software Engineer",
    "Java Developer",
    "Spring Boot",
    "React",
    "Node.js",
    "TypeScript",
    "Technical Writing",
    "Software Architecture",
    "Web Development",
  ],
  authors: [{ name: "Léon Zhang" }],
  creator: "Léon Zhang",
  publisher: "Léon Zhang",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.pohvii.cloud"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "zh-CN": "/zh",
    },
  },
  openGraph: {
    title: "Léon Zhang - Software Engineer & Tech Writer",
    description:
      "Software Engineer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
    url: "https://www.pohvii.cloud",
    siteName: "Léon Zhang",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Léon Zhang - Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Léon Zhang - Software Engineer & Tech Writer",
    description:
      "Software Engineer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
    images: ["/twitter-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#202124" },
  ],
};

export default async function LangLayout(props: LayoutProps<"/[lang]">) {
  const { lang } = await props.params;
  const { children } = props;
  const dictionary = await getDictionary(lang as "en" | "zh");
  const isProduction = process.env.NODE_ENV === "production";
  const skipToContentLabel =
    lang === "zh" ? "跳到主要内容" : "Skip to main content";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Léon Zhang",
    jobTitle: "Software Engineer",
    description: "Software Engineer specializing in modern web technologies",
    url: "https://www.pohvii.cloud",
    knowsAbout: [
      "Java",
      "Spring Boot",
      "React",
      "Node.js",
      "TypeScript",
      "Software Engineering",
      "Web Development",
    ],
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {!isProduction && (
          <>
            <Script
              src="//unpkg.com/react-scan/dist/auto.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
              data-enabled="true"
            />
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
        <a
          href="#main-content"
          className="focus:bg-background focus:text-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-1100 focus:rounded-sm focus:px-3 focus:py-2 focus:ring-2 focus:outline-none"
        >
          {skipToContentLabel}
        </a>
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          speed={200}
          shadow="0 0 10px color-mix(in oklab, var(--primary) 55%, transparent)"
          zIndex={1050}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LenisProvider>
            <TopBar />
            <Header dictionary={dictionary} lang={lang} />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <BackToTop />
          </LenisProvider>

          {/* Analytics Components - Only in production */}
          {isProduction && (
            <>
              <GoogleAnalytics gaId="G-MV6S5XS1V6" />
              <WebVitals />
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
