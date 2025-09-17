import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { TopBar } from "@/components/top-bar";
import { BackToTop } from "@/components/back-to-top";
import NextTopLoader from "nextjs-toploader";
import { getDictionary } from "./dictionaries";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Léon Zhang - Full Stack Developer & Tech Writer",
    template: "%s | Léon Zhang"
  },
  description: "Full Stack Developer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
  keywords: [
    "Full Stack Developer",
    "Software Engineer",
    "Java Developer",
    "Spring Boot",
    "React",
    "Node.js",
    "TypeScript",
    "Technical Writing",
    "Software Architecture",
    "Web Development"
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
    title: "Léon Zhang - Full Stack Developer & Tech Writer",
    description: "Full Stack Developer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
    url: "https://www.pohvii.cloud",
    siteName: "Léon Zhang",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Léon Zhang - Full Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Léon Zhang - Full Stack Developer & Tech Writer",
    description: "Full Stack Developer specializing in modern web technologies. Sharing insights on Java, Spring Boot, Node.js, React, and software engineering best practices.",
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

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as "en" | "zh");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Léon Zhang",
    jobTitle: "Full Stack Developer",
    description: "Full Stack Developer specializing in modern web technologies",
    url: "https://www.pohvii.cloud",
    knowsAbout: [
      "Java",
      "Spring Boot",
      "React",
      "Node.js",
      "TypeScript",
      "Software Engineering",
      "Web Development"
    ]
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextTopLoader
          color="var(--primary-red)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="cubic-bezier(0.4, 0, 0.2, 1)"
          speed={200}
          shadow="0 0 10px var(--primary-red), 0 0 20px rgba(237, 37, 78, 0.3)"
          zIndex={1031}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopBar />
          <Header dictionary={dictionary} lang={lang} />
          <main>{children}</main>
          <BackToTop />
        </ThemeProvider>
      </body>
    </html>
  );
}
