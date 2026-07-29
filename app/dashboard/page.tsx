import type { Metadata } from "next";
import { SITE } from "../constants";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

const title = "Hedge Capital Dashboard | $HEDGE";
const description =
  "Track the public Hyperliquid AI equity short book, creator-fee receipts, qualifying realized profit, $HEDGE buybacks, and burns.";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/dashboard",
  },
  openGraph: {
    title,
    description,
    url: "/dashboard",
    images: [
      {
        url: SITE.ogImage,
        width: 1280,
        height: 426,
        alt: "Hedge the Hedgehog capital dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [SITE.ogImage],
  },
};

export default function DashboardPage() {
  return (
    <main className="site-shell hedge-site dashboard-site">
      <SiteHeader />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
