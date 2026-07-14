import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Gauge, ShieldCheck } from "lucide-react";
import { homePillars, landingStats } from "./data";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="landing-hero">
        <div className="landing-content">
          <p className="eyebrow">HOODX native leverage terminal</p>
          <h1>Hood3</h1>
          <p className="hero-lede">
            Hood3 turns protocol flow into a transparent NLT flywheel: claim fees, route SOL, fund Hyperliquid, expand a
            HOOD long, burn HOODX, and publish the receipts like a professional onchain desk.
          </p>

          <div className="hero-actions">
            <Link className="button primary" href="/dashboard">
              View dashboard
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button ghost dark" href="/thesis">
              Read Hood Thesis
            </Link>
          </div>
        </div>

        <div className="logo-stage" aria-label="Hood3 logo">
          <Image src="/hood3-logo.png" alt="HOOD3" width={1248} height={1086} priority />
        </div>

        <div className="hero-command">
          <span>Desk mode</span>
          <strong>Automation rail ready</strong>
          <small>Zeroed until live Supabase events arrive</small>
        </div>
      </section>

      <section className="landing-stat-row" aria-label="Hood3 protocol snapshot">
        {landingStats.map((stat) => (
          <div className="landing-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </section>

      <section className="content-band landing-preamble">
        <div>
          <p className="eyebrow">Why Hood3 exists</p>
          <h2>A cleaner surface for an aggressive thesis.</h2>
        </div>
        <p>
          The homepage stays focused on the visual identity and live desk snapshot. The dashboard holds the automation
          rail, transaction terminal, and NLT backing logic; the HOOD bull case has its own dedicated page.
        </p>
      </section>

      <section className="feature-grid content-band">
        {homePillars.map((pillar) => {
          const Icon = pillar.icon;

          return (
            <article className="feature-card" key={pillar.title}>
              <span className="icon-chip">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          );
        })}
      </section>

      <section className="content-band command-band">
        <div>
          <span className="icon-chip">
            <Gauge size={18} aria-hidden="true" />
          </span>
          <h2>Dashboard moved to its own page.</h2>
          <p>
            Account linking, NLT backing, bridge metrics, and the “how it works” flow are grouped into the desk page.
          </p>
        </div>
        <Link className="button primary" href="/dashboard">
          Open dashboard
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="content-band compliance-strip">
        <div>
          <Flame size={18} aria-hidden="true" />
          <span>Burns and position size stay in the top header on every route.</span>
        </div>
        <div>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>Execution is server-side only, with browser keys kept out of the product surface.</span>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
