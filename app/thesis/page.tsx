import { ArrowRight, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { risks, sourceLinks, thesisPoints, thesisRisks } from "../data";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata = {
  title: "Hood Thesis | Hood3",
  description: "The Hood3 bull case for a fee-backed HOOD long and NLT flywheel.",
};

export default function ThesisPage() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="page-hero thesis-hero">
        <p className="eyebrow">Hood Thesis</p>
        <h1>HOOD stock bull thesis.</h1>
        <p>
          The bull thesis is that Robinhood is becoming a financial super-app for younger active users, with deposits,
          options, event contracts, margin, tokenization, and subscription revenue compounding into a broader earnings
          base.
        </p>
        <Link className="button primary" href="/dashboard">
          See the flywheel
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>

      <section className="thesis-grid content-band">
        {thesisPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article className="thesis-card" key={point.label}>
              <span className="icon-chip">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p>{point.label}</p>
                <strong>{point.value}</strong>
              </div>
              <h3>{point.text}</h3>
            </article>
          );
        })}
      </section>

      <section className="content-band thesis-memo">
        <div>
          <p className="eyebrow">Core view</p>
          <h2>The HOOD bull case is not just trading volume.</h2>
        </div>
        <p>
          Hood3 is built around the idea that Robinhood has multiple compounding surfaces: funded accounts, asset growth,
          margin balances, options activity, event contracts, Gold subscriptions, crypto infrastructure, and international
          tokenized assets. A single HOOD long is a blunt instrument, but it gives the NLT flywheel a clear public
          benchmark.
        </p>
      </section>

      <section className="content-band thesis-risk-grid">
        <div className="risk-intro">
          <span className="icon-chip warning">
            <TriangleAlert size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">Bear case</p>
            <h2>What can break the thesis.</h2>
          </div>
        </div>

        <div className="risk-cards">
          {thesisRisks.map((risk) => (
            <article className="risk-card" key={risk.label}>
              <h3>{risk.label}</h3>
              <p>{risk.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band legal-risk-list">
        <h2>NLT-specific risks</h2>
        <ul>
          {risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <section className="content-band source-panel">
        <p className="eyebrow">Source notes</p>
        <div className="source-panel-links">
          {sourceLinks.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              {source.label}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
