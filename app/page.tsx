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
          <p className="eyebrow">Hood3</p>
          <h1>The Leveraged Bet on HOOD.</h1>
          <p className="hero-power">Powered by the Native Leverage Token (NLT) Flywheel.</p>
          <p className="hero-lede">
            100% of creator fees fund a public HOOD long on Hyperliquid. Realized profits buy back and permanently burn
            $HOOD3.
          </p>
          <p className="hero-flow">
            Creator Fees → HOOD Long → Realized Profit → HOOD3 Buyback → Permanent Burn
          </p>
          <p className="hero-close">
            The more HOOD wins, the more HOOD3 disappears.
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
          <span>NLT Flywheel</span>
          <strong>Public long + permanent burn</strong>
          <small>HOOD long exposure is mechanism strength, not a holder claim.</small>
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
          <h2>A proprietary loop around the HOOD thesis.</h2>
        </div>
        <p>
          Hood3 is powered by the strength of the NLT Flywheel. Creator fees feed the HOOD long, realized profits buy
          and burn HOOD3, and the dashboard keeps receipts visible.
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
            Current HOOD long, fees deployed, realized profit, buybacks, burns, and the “how it works” flow are grouped
            into the desk page.
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
          <span>Current HOOD long, realized profit, and burn metrics stay visible on every route.</span>
        </div>
        <div>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>The HOOD long is public mechanism strength, not a reserve claim.</span>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
