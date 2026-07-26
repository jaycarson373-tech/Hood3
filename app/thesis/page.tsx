import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  TriangleAlert,
} from "lucide-react";
import { ANSEM, SITE } from "../constants";
import { risks, bullThesisPoints, thesisRisks } from "../data";
import { BullBackdrop } from "../components/BullVisuals";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

const title = "Black Bull Lore | BBL";
const description =
  "The lore and thesis behind BBL, Black Bull Long: public ANSEMUSDT 5x exposure on Aster, transparent execution, and conditional $BBL buyback burns.";

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

export default function ThesisPage() {
  return (
    <main className="site-shell bbl-site">
      <SiteHeader />
      <BullBackdrop variant="lore" />

      <section className="page-hero lore-hero">
        <div>
          <p className="eyebrow">BLACK BULL LORE</p>
          <h1>THE BULL BEHIND THE BULL.</h1>
          <p>
            A directional trader became a character. The character became an
            onchain asset. BBL turns that lore into a transparent 5x long flywheel.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/dashboard">
              Enter Dashboard
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              className="button ghost"
              href={ANSEM.dexScreenerUrl}
              target="_blank"
              rel="noreferrer"
            >
              View ANSEM
              <ExternalLink size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <Image
          src="/ansem-token.jpg"
          alt="The Black Bull ANSEM token mark"
          width={800}
          height={800}
          priority
          sizes="(max-width: 720px) 82vw, 420px"
        />
      </section>

      <section className="thesis-grid section-band">
        {bullThesisPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article key={point.label}>
              <span className="icon-chip">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div>
                <p>{point.label}</p>
                <strong>{point.value}</strong>
              </div>
              <h2>{point.text}</h2>
            </article>
          );
        })}
      </section>

      <section className="lore-memo section-band">
        <div>
          <p className="eyebrow">THE STORY, WITHOUT THE FAIRY TALE</p>
          <h2>
            HIGH CONVICTION.
            <br />
            HIGH ATTENTION.
            <br />
            HIGH RISK.
          </h2>
        </div>
        <div className="memo-copy">
          <p>
            Ansem&apos;s early WIF call is widely cited as part of his trading
            reputation. His audience later crossed one million followers, and
            the Black Bull identity became a market-native symbol for
            aggressive bullish conviction.
          </p>
          <p>
            ANSEM was launched by the community, not by BBL. A large token
            allocation reached Ansem&apos;s public wallet and the market grew
            into a nine-figure asset. Those facts do not guarantee future
            performance.
          </p>
          <div className="source-row">
            <a
              href={ANSEM.officialSiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              Black Bull site
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a
              href={ANSEM.officialXUrl}
              target="_blank"
              rel="noreferrer"
            >
              Black Bull on X
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            <a
              href={ANSEM.ansemXUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ansem on X
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="risk-section section-band">
        <div className="risk-intro">
          <span className="icon-chip warning">
            <TriangleAlert size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">RISK</p>
            <h2>WHAT CAN BREAK THE THESIS.</h2>
          </div>
        </div>
        <div className="risk-grid">
          {thesisRisks.map((risk) => (
            <article key={risk.label}>
              <h3>{risk.label}</h3>
              <p>{risk.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="legal-risk-list section-band">
        <h2>BBL risks</h2>
        <ul>
          {risks.map((risk) => (
            <li key={risk}>{risk}</li>
          ))}
        </ul>
      </section>

      <SiteFooter />
    </main>
  );
}
