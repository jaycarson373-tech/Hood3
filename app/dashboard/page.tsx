import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

const title = "Dashboard | Hood3 NLT Flywheel";
const description =
  "Track Hood3's public HOOD long, creator fees deployed, realized profit, HOOD3 buybacks, and permanent burns.";

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
    <main className="site-shell">
      <SiteHeader />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
