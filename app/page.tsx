import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { hoodChartUrl } from "./data";
import { LongcatScrollBackdrop, LongcatSignalField, SignalGraphicStack } from "./components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const liveStats = [
  "SOL LONG SIZE",
  "TOTAL SOL BRIDGED",
  "TOTAL FEES DEPLOYED",
  "ENTRY PRICE",
  "CURRENT PRICE",
  "LEVERAGE",
  "UNREALIZED PNL",
  "REALIZED PROFIT",
  "TOTAL BUYBACKS",
  "TOTAL $LONGCAT BURNED",
  "LAST FEE CLAIM",
  "LAST HYPERLIQUID UPDATE",
];

const flow = [
  "$LONGCAT trades",
  "fees claim every 15 minutes",
  "bridge to Hyperliquid",
  "auto-long SOL",
  "profit buys + burns",
];

const thesis = [
  "Solana remains one of crypto's fastest retail arenas.",
  "SOL is the clean directional proxy for Solana's liquidity and attention cycle.",
  "Hyperliquid gives the flywheel a public leverage venue.",
];

const faq = [
  {
    question: "What is Longcat?",
    answer: "$LONGCAT is a Solana native leverage token designed around a public SOL long on Hyperliquid.",
  },
  {
    question: "Where do fees go?",
    answer: "Creator fees are designed to build the SOL position, subject to execution, risk controls, and operating conditions.",
  },
  {
    question: "What happens if the long wins?",
    answer: "Qualifying realized profit can market-buy $LONGCAT and permanently burn it.",
  },
  {
    question: "Guaranteed?",
    answer: "No. Leveraged positions can lose money or get liquidated. Buybacks only happen when qualifying realized profits exist.",
  },
];

export default function Home() {
  return (
    <main className="site-shell hood3-shell hood3-terminal-site longcat-sol-site">
      <SiteHeader />
      <LongcatScrollBackdrop />
      <LongcatSignalField />

      <section className="hood-section hood-hero" id="buy-longcat">
        <div className="hood-hero__copy">
          <p className="eyebrow">Solana native leverage cat</p>
          <h1>
            THE LONGEST CAT
            <span>ON SOLANA.</span>
          </h1>
          <div className="hero-copy-lines">
            <p>Creator fees scale into a public SOL long on Hyperliquid.</p>
            <p>Realized profits bridge back, buy back, and burn $LONGCAT.</p>
          </div>
          <div className="hero-actions meme-actions">
            <Link className="button primary long-button" href="#buy-longcat">
              Buy $LONGCAT
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button ghost long-button" href="/dashboard">
              View The Long
            </Link>
          </div>
          <p className="hero-ca">CA: soon on Solana</p>
        </div>
      </section>

      <section className="hood-section live-metrics-section" aria-label="Live dashboard">
        <div className="section-label">LIVE DASHBOARD</div>
        <div className="length-grid launch-metric-grid">
          {liveStats.map((label) => (
            <article key={label} className="length-stat launch-metric">
              <span>{label}</span>
              <strong>Awaiting live integration.</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="hood-section origin-section" id="origin">
        <div className="section-label">SOLANA THESIS</div>
        <h2>LONGCAT TURNS MEME FLOW INTO DIRECTIONAL SOL EXPOSURE.</h2>
        <div className="origin-grid hood-origin-grid">
          <div className="origin-board">
            <span>01</span>
            <strong>Solana speed</strong>
            <p>Longcat is built for the chain where memes, retail attention, and liquidity move fast.</p>
          </div>
          <div className="origin-board">
            <span>02</span>
            <strong>Hyperliquid execution</strong>
            <p>The mechanism is designed to route creator fees into a transparent SOL long on Hyperliquid.</p>
          </div>
        </div>
      </section>

      <section className="hood-section mechanic-section" id="mechanism">
        <div className="section-label">MECHANISM</div>
        <h2>FEES LONG SOL. PROFITS BURN $LONGCAT.</h2>
        <div className="long-flow">
          {flow.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <p className="mechanism-note">
          The terminal is built to publish each claim, bridge, SOL order, profit take, buyback, and burn.
        </p>
      </section>

      <section className="hood-section thesis-section" id="hood-thesis">
        <div className="section-label">WHY SOL?</div>
        <h2>THE SOLANA BET NEEDS THE LONGEST CAT.</h2>
        <div className="thesis-tape">
          {thesis.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="thesis-closing">
          IF SOL WINS,
          <br />
          LONGCAT GETS SCARCER.
        </p>
        <a className="button ghost long-button" href={hoodChartUrl}>
          View SOL
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="hood-section terminal-section" id="live-position">
        <div className="section-label">LIVE LONG</div>
        <h2>CLAIMS, BRIDGES, LONGS, BUYBACKS, AND BURNS UPDATE IN PUBLIC.</h2>
        <div className="terminal-strip">
          <span>POSITION SIZE</span>
          <strong>Awaiting live integration.</strong>
          <span>TOTAL SOL BRIDGED</span>
          <strong>Awaiting live integration.</strong>
          <span>REALIZED PROFIT</span>
          <strong>Awaiting live integration.</strong>
          <span>LAST POSITION UPDATE</span>
          <strong>AWAITING FIRST HYPERLIQUID RECEIPT</strong>
        </div>
        <div className="button-row">
          <Link className="button primary long-button" href="/dashboard">
            Verify Position
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button ghost long-button" href="/dashboard">
            Longcat Terminal
          </Link>
        </div>
      </section>

      <section className="hood-section burn-section" id="burns">
        <div>
          <p className="section-label">BUYBACKS AND BURNS</p>
          <h2>REALIZED PROFITS BUY BACK AND BURN $LONGCAT.</h2>
          <p className="microcopy">Only qualifying realized trading profits can trigger buybacks and permanent burns.</p>
        </div>
        <SignalGraphicStack />
      </section>

      <section className="hood-section faq-section meme-faq" id="faq">
        <div className="section-label">FAQ</div>
        <div className="faq-grid">
          {faq.map((item) => (
            <article className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
