import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { EXTERNAL_LINKS, SITE } from "../constants";
import { mandatePoints, risks } from "../data";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const title = "Investment Mandate | Hedge the Hedgehog";
const description =
  "The public mandate behind $HEDGE: creator-fee capital formation, transparent perpetual execution, and conditional buyback burns.";

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
    images: [
      {
        url: SITE.ogImage,
        width: 1280,
        height: 426,
        alt: "Hedge the Hedgehog investment mandate",
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

export default function ThesisPage() {
  return (
    <main className="site-shell hedge-site">
      <SiteHeader />

      <section className="mandate-hero">
        <Image
          src="/hedge-banner.jpg"
          alt="Hedge the Hedgehog with the fund mandate"
          fill
          priority
          sizes="100vw"
        />
        <div>
          <p className="eyebrow">HEDGE CAPITAL MANAGEMENT</p>
          <h1>THE INVESTMENT MANDATE.</h1>
          <p>
            Transparent capital formation. Public risk. Conditional supply
            reduction.
          </p>
          <div className="button-row">
            <Link className="button button-gold" href="/dashboard">
              Open Dashboard
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              className="button button-inverse"
              href={EXTERNAL_LINKS.chart}
              target="_blank"
              rel="noreferrer"
            >
              View $HEDGE
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="mandate-statement section-shell">
        <p className="eyebrow">EXECUTIVE SUMMARY</p>
        <h2>
          A MEME COIN WITH
          <br />
          AN INVESTMENT COMMITTEE.
        </h2>
        <p>
          The mandate is designed to route creator-fee flow into managed
          perpetual exposure. When qualifying realized profit exists, it may
          return to Solana to buy and permanently burn $HEDGE.
        </p>
      </section>

      <section className="mandate-detail section-shell">
        {mandatePoints.map((point) => {
          const Icon = point.icon;

          return (
            <article key={point.value}>
              <span>{point.value}</span>
              <Icon size={22} aria-hidden="true" />
              <div>
                <p>{point.label}</p>
                <h2>{point.text}</h2>
              </div>
            </article>
          );
        })}
      </section>

      <section className="risk-memo section-shell">
        <div>
          <ShieldAlert size={24} aria-hidden="true" />
          <p className="eyebrow">RISK COMMITTEE</p>
          <h2>THE HEDGE CAN LOSE.</h2>
        </div>
        <ol>
          {risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ol>
      </section>

      <section className="mandate-close section-shell">
        <p>THE FIRST PERPETUAL HEDGE FUND ON SOLANA.</p>
        <Link className="text-arrow" href="/dashboard">
          Review the public book
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
