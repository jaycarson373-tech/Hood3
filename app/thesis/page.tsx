import type { Metadata } from "next";
import { ArrowRight, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { hoodChartUrl, hoodThesisPoints, risks, sourceLinks, thesisRisks } from "../data";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const title = "HOOD Thesis | Hood3";
const description =
  "The Hood3 thesis for HOOD: Robinhood Chain distribution, Lighter-based leverage, and $HOOD3 buyback burns from qualifying realized trading profits.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/thesis",
  },
  openGraph: {
    title,
    description,
    url: "/thesis",
  },
  twitter: {
    title,
    description,
  },
};

export default function ThesisPage() {
  return (
    <main className="site-shell hood3-shell hood3-terminal-site">
      <SiteHeader />

      <section className="page-hero thesis-hero hood3-thesis-hero">
        <p className="eyebrow">HOOD Thesis</p>
        <h1>HOOD is the directional bet.</h1>
        <p>Robinhood Chain distribution. Lighter execution. Public leverage. No certainty implied.</p>
        <div className="button-row">
          <Link className="button primary" href="/dashboard">
            View the long
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <a className="button ghost" href={hoodChartUrl}>
            View HOOD
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="thesis-grid content-band">
        {hoodThesisPoints.map((point) => {
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

      <section className="content-band thesis-memo hood3-memo">
        <div>
          <p className="eyebrow">Core view</p>
          <h2>
            IF HOOD WINS,
            <br />
            HOOD3 GETS SCARCER.
          </h2>
        </div>
        <p>2% creator fees are designed to scale into a public HOOD long on Lighter. Qualifying realized profits buy back and burn $HOOD3.</p>
      </section>

      <section className="content-band thesis-risk-grid">
        <div className="risk-intro">
          <span className="icon-chip warning">
            <TriangleAlert size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">Risk</p>
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
        <h2>Hood3 risks</h2>
        <ul>
          {risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <section className="content-band source-panel">
        <p className="eyebrow">Links</p>
        <div className="source-panel-links">
          {sourceLinks.map((source) => (
            <a key={source.href} href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
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
