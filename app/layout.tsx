import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE } from "./constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function requestSiteUrl() {
  if (SITE.configuredUrl) return SITE.configuredUrl;

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = await requestSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: SITE.title,
    description: SITE.description,
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [{ url: "/favicon.png", type: "image/png", sizes: "512x512" }],
      shortcut: "/favicon.png",
      apple: [
        {
          url: "/apple-touch-icon.png",
          type: "image/png",
          sizes: "180x180",
        },
      ],
    },
    openGraph: {
      title: SITE.title,
      description: SITE.description,
      url: "/",
      siteName: SITE.name,
      type: "website",
      images: [
        {
          url: SITE.ogImage,
          width: 1729,
          height: 910,
          alt: "BBL, Black Bull Long",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE.title,
      description: SITE.description,
      images: [SITE.ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
