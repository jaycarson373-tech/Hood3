import type { Metadata } from "next";
import { SITE } from "../constants";
import { LongcatScrollBackdrop } from "../components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { getLaunchState } from "../launch-state";
import { DashboardClient } from "./DashboardClient";

const title = "Live Position | Longcat";
const description =
  "Track Longcat's public SOL long on Hyperliquid, creator fees deployed, realized profit, $LONGCAT buybacks, and burns.";

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
        width: 1200,
        height: 630,
        alt: "Long Cat, the longest cat on Solana",
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
  const isLive = getLaunchState() === "live";

  return (
    <main className="site-shell longcat-shell launch-terminal-site longcat-sol-site longcat-dashboard-site">
      <SiteHeader />
      {isLive ? (
        <DashboardClient />
      ) : (
        <>
          <LongcatScrollBackdrop variant="dashboard" />
          <section className="page-hero compact-page-hero">
            <p className="eyebrow">Longcat terminal</p>
            <h1>One position. Extending in public.</h1>
            <p>The public SOL long, buybacks, and burns will be published here.</p>
          </section>
        </>
      )}
      <SiteFooter />
    </main>
  );
}
