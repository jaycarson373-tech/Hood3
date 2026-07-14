import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { DashboardClient } from "./DashboardClient";

export const metadata = {
  title: "Dashboard | Hood3 NLT Flywheel",
  description: "Hood3 read-only dashboard for HOOD long exposure, HOODX burns, and NLT backing.",
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
