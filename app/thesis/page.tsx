import type { Metadata } from "next";
import { ArrowRight, ExternalLink, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { cashcatChartUrl, cashcatThesisPoints, risks, sourceLinks, thesisRisks } from "../data";
import { LongcatMascot } from "../components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const title = "Cashcat Thesis | Longcat";
const description =
  "The Longcat thesis for Cashcat: Robinhood-coded meme conviction, public leveraged exposure, and $LONGCAT buyback burns from realized trading profits.";

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
    <main className="site-shell longcat-shell">
      <SiteHeader />

      <section className="page-hero thesis-hero longcat-thesis-hero">
        <p className="eyebrow">Cashcat Thesis</p>
        <h1>The native cat of Robinhood deserves the longest position on Robinhood.</h1>
        <p>
          Our thesis is simple: if Robinhood Chain wins retail attention, Cashcat is positioned to become one of its
          defining native speculative assets. $LONGCAT expresses that view through creator fees that extend one public
          Cashcat long.
        </p>
        <div className="button-row">
          <Link className="button primary" href="/dashboard">
            View the long
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <a className="button ghost" href={cashcatChartUrl}>
            View Cashcat
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="thesis-grid content-band">
        {cashcatThesisPoints.map((point) => {
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

      <section className="content-band thesis-memo cashcat-memo">
        <div>
          <p className="eyebrow">Core view</p>
          <h2>IF ROBINHOOD BECOMES THE HOME OF RETAIL, CASHCAT CAN BECOME ITS CAT.</h2>
        </div>
        <p>
          We believe memecoins are often the first assets new retail participants understand and trade. Strong native
          mascots can become cultural indexes for their chains. If Robinhood brings more retail activity onchain, Cashcat
          has a chance to become one of its dominant speculative symbols.
        </p>
      </section>

      <section className="content-band dual-visual-section">
        <div className="dual-panel dual-panel--long">
          <p className="eyebrow">Directional exposure</p>
          <h2>The longer Longcat trades, the longer the long becomes.</h2>
          <LongcatMascot variant="line" />
        </div>
        <div className="dual-panel dual-panel--short">
          <p className="eyebrow">Supply pressure</p>
          <h2>Realized trading profits buy back and burn $LONGCAT.</h2>
          <p>No buyback is guaranteed. It only happens when qualifying realized profits exist.</p>
        </div>
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
