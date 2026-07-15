import type { Metadata } from "next";
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

const siteTitle = "Longcat | The Longest Long on Robinhood";
const siteDescription =
  "Longcat is a native leverage token for Cashcat: every creator fee extends one public Cashcat long, and realized trading profits buy back and burn $LONGCAT.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hood3pump.fun"),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Longcat",
    type: "website",
    images: [
      {
        url: "/longcat-mark.svg",
        width: 1200,
        height: 630,
        alt: "Longcat mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/longcat-mark.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
