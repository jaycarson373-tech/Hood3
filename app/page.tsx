import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  BarChart3,
  Flame,
  History,
  Landmark,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { EXTERNAL_LINKS } from "./constants";
import { ActivityTicker } from "./components/ActivityTicker";
import { HedgeTerminal } from "./components/HedgeTerminal";
import { MarketStrip } from "./components/MarketStrip";
import { MemeGallery } from "./components/MemeGallery";
import { PfpStudio } from "./components/PfpStudio";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { mandatePoints, roadmap, strategySteps } from "./data";

const flow = [
  "Creator Fees",
  "Bridge",
  "AI Blue-Chip Shorts",
  "Realized Short Profit",
  "Bridge Back",
  "Buyback",
  "Burn",
];

const proofLinks = [
  {
    label: "Total fees collected",
    detail: "Verified claim receipts",
    href: "/dashboard",
    icon: ReceiptText,
    external: false,
  },
  {
    label: "Total bridged",
    detail: "Verified bridge receipts",
    href: "/dashboard#activity",
    icon: ArrowLeftRight,
    external: false,
  },
  {
    label: "Short collateral",
    detail: "Public Hyperliquid account",
    href: EXTERNAL_LINKS.position,
    icon: Landmark,
    external: true,
  },
  {
    label: "Open shorts",
    detail: "Public Hyperliquid account",
    href: EXTERNAL_LINKS.position,
    icon: ShieldCheck,
    external: true,
  },
  {
    label: "Current profit",
    detail: "Published short-book PnL",
    href: "/dashboard",
    icon: BarChart3,
    external: false,
  },
  {
    label: "Total burned",
    detail: "Permanent burn receipts",
    href: "/dashboard#activity",
    icon: Flame,
    external: false,
  },
  {
    label: "Buyback history",
    detail: "Published market purchases",
    href: "/dashboard#activity",
    icon: RefreshCw,
    external: false,
  },
  {
    label: "Bridge history",
    detail: "Published capital routes",
    href: "/dashboard#activity",
    icon: History,
    external: false,
  },
  {
    label: "Wallet address",
    detail: "Public execution wallet",
    href: EXTERNAL_LINKS.position,
    icon: Wallet,
    external: true,
  },
  {
    label: "Transaction explorer",
    detail: "Receipt-level proof",
    href: "/dashboard#activity",
    icon: ReceiptText,
    external: false,
  },
  {
    label: "Token contract",
    detail: "Solana contract market",
    href: EXTERNAL_LINKS.buy,
    icon: Landmark,
    external: true,
  },
];

const faq = [
  {
    question: "What is $HEDGE?",
    answer:
      "$HEDGE is a speculative Solana community token built around a transparent Hyperliquid short book.",
  },
  {
    question: "Where do creator fees go?",
    answer:
      "The system is designed to route creator fees into a public Hyperliquid account that shorts selected AI and technology blue chips, subject to execution and risk controls.",
  },
  {
    question: "What happens to realized profit?",
    answer:
      "Qualifying realized profit may return to Solana, market-buy $HEDGE, and permanently burn the purchased tokens.",
  },
  {
    question: "What does the fund short?",
    answer:
      "The mandate focuses on AI and technology blue chips it identifies as overvalued. The exact markets, position sizes, leverage, and receipts are published when verified data exists.",
  },
  {
    question: "Are the shorts guaranteed to profit?",
    answer:
      "No. Equity perpetual shorts can lose money, get squeezed, or be liquidated. Buybacks and burns only occur when qualifying realized profit exists.",
  },
];

export default function Home() {
  return (
    <main className="site-shell hedge-site">
      <SiteHeader />

      <section className="hedge-hero" id="top">
        <Image
          className="hero-mascot"
          src="/hedge-logo.jpg"
          alt="Hedge the Hedgehog in a black suit holding stacks of cash"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-skyline" aria-hidden="true" />
        <div className="hero-chart" aria-hidden="true">
          <svg viewBox="0 0 1200 240" preserveAspectRatio="none">
            <path d="M0 208 L118 198 L214 205 L326 164 L420 177 L535 130 L640 144 L758 88 L852 106 L963 55 L1070 70 L1200 16" />
          </svg>
        </div>
        <div className="floating-bills" aria-hidden="true">
          <span>$</span>
          <span>$</span>
          <span>$</span>
        </div>

        <div className="hero-content">
          <p className="eyebrow">HEDGE CAPITAL MANAGEMENT</p>
          <h1>
            HEDGE
            <span>THE HEDGEHOG</span>
          </h1>
          <p className="hero-subtitle">
            The first perpetual short fund on Solana.
          </p>
          <p className="hero-mandate">
            Creator fees fund a public Hyperliquid short book focused on
            overvalued AI and technology blue chips.
          </p>
          <div className="hero-actions">
            <a
              className="button button-dark"
              href={EXTERNAL_LINKS.buy}
              target="_blank"
              rel="noreferrer"
            >
              Buy $HEDGE
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              className="button button-light"
              href={EXTERNAL_LINKS.chart}
              target="_blank"
              rel="noreferrer"
            >
              View Chart
              <BarChart3 size={16} aria-hidden="true" />
            </a>
          </div>
          <MarketStrip />
        </div>
      </section>

      <ActivityTicker />

      <section className="banner-ledger" aria-label="Hedge investment mandate">
        <Image
          src="/hedge-banner.jpg"
          alt="Hedge the Hedgehog investment mandate"
          width={1280}
          height={426}
          sizes="100vw"
        />
      </section>

      <section className="strategy-section section-shell" id="strategy">
        <div className="section-intro">
          <p className="eyebrow">THE MANDATE</p>
          <h2>THE FUND HAS ONE JOB.</h2>
          <p>
            Short the AI premium in public. Convert qualifying realized gains
            into permanent $HEDGE supply reduction.
          </p>
        </div>

        <div className="strategy-grid">
          {strategySteps.map((step) => {
            const Icon = step.icon;

            return (
              <article key={step.number}>
                <div>
                  <span>{step.number}</span>
                  <Icon size={19} aria-hidden="true" />
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            );
          })}
        </div>

        <div className="capital-flow" aria-label="Hedge short-book capital flow">
          {flow.map((step, index) => (
            <div key={step}>
              <span>{step}</span>
              {index < flow.length - 1 ? (
                <ArrowRight size={16} aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="terminal-section section-shell" id="dashboard">
        <div className="terminal-copy">
          <p className="eyebrow">LIVE RISK DESK</p>
          <h2>THE SHORT BOOK. WITHOUT THE BLACK BOX.</h2>
          <p>
            Every AI equity short, leverage setting, PnL update, creator-fee
            receipt, buyback, and burn appears only when verified public data
            exists.
          </p>
          <Link className="text-arrow" href="/dashboard">
            Enter the dashboard
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <HedgeTerminal />
      </section>

      <section className="principles-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">INVESTMENT COMMITTEE</p>
          <h2>HEDGE THE AI EUPHORIA.</h2>
        </div>
        <div className="mandate-grid">
          {mandatePoints.map((point) => {
            const Icon = point.icon;

            return (
              <article key={point.value}>
                <span>{point.value}</span>
                <Icon size={20} aria-hidden="true" />
                <h3>{point.label}</h3>
                <p>{point.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="transparency-section section-shell" id="transparency">
        <div className="section-intro inverse">
          <p className="eyebrow">TRANSPARENCY</p>
          <h2>EVERYTHING IS VERIFIABLE.</h2>
          <p>
            The public Hyperliquid account exposes every open short. The receipt
            tape exposes every completed capital movement.
          </p>
        </div>
        <div className="proof-links">
          {proofLinks.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer" : undefined}
              >
                <Icon size={19} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>

      <section className="pfp-section section-shell" id="pfp-studio">
        <div className="section-intro">
          <p className="eyebrow">BUILD YOUR HEDGE FUND IDENTITY</p>
          <h2>REPORT TO THE TRADING FLOOR.</h2>
          <p>
            Pick a desk, add the accessories, and export your Wall Street
            Hedge.
          </p>
        </div>
        <PfpStudio />
      </section>

      <section className="meme-gallery-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">MARKET COMMENTARY</p>
          <h2>THE RESEARCH DESK IS UNSUPERVISED.</h2>
        </div>
        <MemeGallery />
      </section>

      <section className="roadmap-section section-shell" id="roadmap">
        <div className="section-intro">
          <p className="eyebrow">FORWARD GUIDANCE</p>
          <h2>THE QUARTERLY PLAN.</h2>
        </div>
        <div className="roadmap">
          {roadmap.map(([phase, title, detail]) => (
            <article key={phase}>
              <span>{phase}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">RISK DISCLOSURE, BUT READABLE</p>
          <h2>QUESTIONS FROM COMPLIANCE.</h2>
        </div>
        <div className="faq-list">
          {faq.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <Image
          src="/hedge-banner.jpg"
          alt=""
          fill
          sizes="100vw"
        />
        <div>
          <Sparkles size={22} aria-hidden="true" />
          <p>HEDGE CAPITAL MANAGEMENT</p>
          <h2>WE SHORT. WE HEDGE. WE BURN.</h2>
          <a
            className="button button-gold"
            href={EXTERNAL_LINKS.buy}
            target="_blank"
            rel="noreferrer"
          >
            Join the fund
            <Flame size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
