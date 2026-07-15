import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cashcatChartUrl } from "./data";
import { LongcatSpine, MemeGraphicStack } from "./components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const liveStats = [
  "POSITION SIZE",
  "TOTAL FEES DEPLOYED",
  "ENTRY PRICE",
  "CURRENT PRICE",
  "LEVERAGE",
  "UNREALIZED PNL",
  "REALIZED PROFIT",
  "TOTAL BUYBACKS",
  "TOTAL TOKENS BURNED",
  "LAST POSITION UPDATE",
];

const originUrl = "https://amp.knowyourmeme.com/memes/longcat";

const flow = [
  "$LONGCAT trades",
  "2% fees extend $CASHCAT",
  "realized profit buys back",
  "tokens burn",
  "repeat",
];

const thesis = [
  "Robinhood is bringing new retail onchain.",
  "Native ecosystems produce native memes.",
  "Our thesis is Cashcat becomes Robinhood's defining cat.",
];

const faq = [
  {
    question: "What is this?",
    answer: "$LONGCAT is the longest cat on Robinhood. A 2% creator fee extends one public $CASHCAT long.",
  },
  {
    question: "Where do fees go?",
    answer: "The 2% creator fee is designed to extend the Cashcat position, subject to execution, risk controls, and reality.",
  },
  {
    question: "What happens if the long wins?",
    answer: "Realized profit can market-buy $LONGCAT and permanently burn it.",
  },
  {
    question: "Guaranteed?",
    answer: "No. The cat is long, not risk-free. Leveraged positions can lose money or get liquidated.",
  },
];

export default function Home() {
  return (
    <main className="site-shell longcat-shell longcat-meme-site">
      <SiteHeader />
      <LongcatSpine />

      <section className="cat-section meme-hero" id="buy-longcat">
        <div className="meme-hero__copy">
          <h1>
            THE <span className="hero-longest">LONGEST</span> CAT
            <span>ON ROBINHOOD.</span>
          </h1>
          <div className="hero-copy-lines">
            <p>2% creator fees scale into a public $CASHCAT long on Hyperliquid.</p>
            <p>Realized profits buy back and burn $LONGCAT.</p>
          </div>
          <div className="hero-actions meme-actions">
            <Link className="button primary long-button" href="#buy-longcat">
              Buy Longcat
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button ghost long-button" href="/dashboard">
              View The Long
            </Link>
          </div>
          <p className="hero-ca">CA: 0xcd026c6da703739fe13e3d6f13caf4c0f9627777</p>
        </div>

      </section>

      <section className="cat-section live-metrics-section" aria-label="Live dashboard">
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

      <section className="cat-section origin-section" id="origin">
        <div className="section-label">ORIGIN LORE</div>
        <h2>BEFORE THE LONG WAS A POSITION, THE LONG WAS A CAT.</h2>
        <div className="origin-grid">
          <Image
            className="origin-cat-photo"
            src="/longcat-origin-real.jpg"
            alt="Original Longcat meme photo"
            width={180}
            height={326}
          />
          <div className="origin-board">
            <span>2004-2005</span>
            <strong>Futaba / 2chan</strong>
            <p>A white cat named Shiroi becomes one of the internet&apos;s earliest impossible-length memes.</p>
          </div>
        </div>
        <a className="button ghost long-button" href={originUrl} target="_blank" rel="noreferrer">
          Know Your Meme
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="cat-section mechanic-section" id="mechanism">
        <div className="section-label">MECHANIC</div>
        <h2>2% CREATOR FEES SCALE THE PUBLIC CASHCAT LONG.</h2>
        <div className="long-flow">
          {flow.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </section>

      <section className="cat-section thesis-section" id="cashcat-thesis">
        <div className="section-label">WHY CASHCAT?</div>
        <h2>CASHCAT IS THE DIRECTIONAL BET.</h2>
        <div className="thesis-tape">
          {thesis.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="thesis-closing">
          IF CASHCAT WINS,
          <br />
          LONGCAT GETS LONGER.
        </p>
        <a className="button ghost long-button" href={cashcatChartUrl}>
          View Cashcat
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="cat-section terminal-section" id="live-position">
        <div className="section-label">LIVE LONG</div>
        <h2>POSITION UPDATES IN PUBLIC.</h2>
        <div className="terminal-strip">
          <span>POSITION SIZE</span>
          <strong>Awaiting live integration.</strong>
          <span>REALIZED PROFIT</span>
          <strong>Awaiting live integration.</strong>
          <span>LAST POSITION UPDATE</span>
          <strong>AWAITING FIRST LONG</strong>
        </div>
        <div className="button-row">
          <Link className="button primary long-button" href="/dashboard">
            Verify Position
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button ghost long-button" href="/dashboard">
            Terminal
          </Link>
        </div>
      </section>

      <section className="cat-section burn-section" id="burns">
        <div>
          <p className="section-label">BUYBACKS AND BURNS</p>
          <h2>PROFITS BUY BACK AND BURN $LONGCAT.</h2>
          <p className="microcopy">Only realized trading profits can trigger buybacks and permanent burns.</p>
        </div>
        <MemeGraphicStack />
      </section>

      <section className="cat-section faq-section meme-faq" id="faq">
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
