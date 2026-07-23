import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

const title = "Live Position | Longcat";
const description =
  "Track Longcat's public SOL long on Hyperliquid, creator fees deployed, realized profit, $LONGCAT buybacks, and burns.";

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
  },
  twitter: {
    title,
    description,
  },
};

export default function DashboardPage() {
  return (
    <main className="site-shell hood3-shell hood3-terminal-site longcat-sol-site">
      <SiteHeader />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
