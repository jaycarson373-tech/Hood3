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

export const metadata: Metadata = {
  metadataBase: new URL("https://hood3-nlt-flywheel.sufficientlev.chatgpt.site"),
  title: "Hood3 | HOODX Native Leverage",
  description:
    "A cinematic Hood3 site for HOODX burns, SOL bridge flow, and a fee-backed HOOD long dashboard.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Hood3 | HOODX Native Leverage",
    description:
      "A cinematic Hood3 site for HOODX burns, SOL bridge flow, and a fee-backed HOOD long dashboard.",
    images: ["/hood3-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
