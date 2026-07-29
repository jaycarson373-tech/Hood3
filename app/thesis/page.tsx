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
  "The public mandate behind $HEDGE: creator-fee capital formation, disclosed AI equity shorts on Hyperliquid, and conditional buyback burns.";

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
            Short overvalued AI blue chips. Publish the risk. Burn $HEDGE with
            qualifying realized gains.
          </p>
          <div className="button-row">
            <Link className="button button-gold" href="/dashboard">
              Open Dashboard
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            {EXTERNAL_LINKS.chart ? (
              <a
                className="button button-inverse"
                href={EXTERNAL_LINKS.chart}
                target="_blank"
                rel="noreferrer"
              >
                View $HEDGE
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            ) : null}
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
          Creator-fee flow is designed to build a disclosed portfolio of
          Hyperliquid shorts in AI and technology companies the mandate
          identifies as overvalued. Qualifying realized short profit may return
          to Solana to buy and permanently burn $HEDGE.
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
          <h2>THE SHORT CAN GET SQUEEZED.</h2>
        </div>
        <ol>
          {risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ol>
      </section>

      <section className="mandate-close section-shell">
        <p>THE FIRST PERPETUAL SHORT FUND ON SOLANA.</p>
        <Link className="text-arrow" href="/dashboard">
          Review the public book
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}
