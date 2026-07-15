import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

const title = "Live Position | Hood3";
const description =
  "Track Hood3's public HOOD long on Lighter, 2% creator fees deployed, realized profit, $HOOD3 buybacks, and burns.";

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
    <main className="site-shell hood3-shell hood3-terminal-site">
      <SiteHeader />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
