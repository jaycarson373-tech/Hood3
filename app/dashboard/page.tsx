import type { Metadata } from "next";
import { SITE } from "../constants";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

const title = "Black Bull Terminal | BBL";
const description =
  "Track BBL creator fees, the public ANSEM spot position, qualifying realized profit, $BBL buybacks, and burns.";

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
        width: 1729,
        height: 910,
        alt: "BBL, Black Bull Long",
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
    <main className="site-shell bbl-site dashboard-site">
      <SiteHeader />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
