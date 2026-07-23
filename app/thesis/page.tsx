import type { Metadata } from "next";
import { ArrowRight, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { hoodChartUrl, hoodThesisPoints, risks, sourceLinks, thesisRisks } from "../data";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const title = "SOL Thesis | Longcat";
const description =
  "The Longcat thesis for SOL: Solana retail liquidity, Hyperliquid-based leverage, and $LONGCAT buyback burns from qualifying realized trading profits.";

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
    <main className="site-shell hood3-shell hood3-terminal-site longcat-sol-site">
      <SiteHeader />

      <section className="page-hero thesis-hero longcat-thesis-hero">
        <p className="eyebrow">SOL Thesis</p>
        <h1>SOL is the directional bet.</h1>
        <p>Solana liquidity. Hyperliquid execution. Public leverage. No certainty implied.</p>
        <div className="button-row">
          <Link className="button primary" href="/dashboard">
            View the long
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <a className="button ghost" href={hoodChartUrl}>
            View SOL
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

      <section className="content-band thesis-memo longcat-memo">
        <div>
          <p className="eyebrow">Core view</p>
          <h2>
            IF SOL WINS,
            <br />
            LONGCAT GETS SCARCER.
          </h2>
        </div>
        <p>Creator fees are designed to scale into a public SOL long on Hyperliquid. Qualifying realized profits buy back and burn $LONGCAT.</p>
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
        <h2>Longcat risks</h2>
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
