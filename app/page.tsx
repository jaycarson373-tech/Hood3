import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { hoodChartUrl } from "./data";
import { Hood3SignalField, SignalGraphicStack } from "./components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const liveStats = [
  "HOOD LONG SIZE",
  "TOTAL FEES DEPLOYED",
  "ENTRY PRICE",
  "CURRENT PRICE",
  "LEVERAGE",
  "UNREALIZED PNL",
  "REALIZED PROFIT",
  "TOTAL BUYBACKS",
  "TOTAL $HOOD3 BURNED",
  "LAST LIGHTER UPDATE",
];

const flow = [
  "$HOOD3 trades",
  "2% fees route",
  "Lighter longs HOOD",
  "realized profit buys $HOOD3",
  "tokens burn",
];

const thesis = [
  "Robinhood Chain can bring a new retail class onchain.",
  "HOOD is the clean directional proxy for Robinhood's own expansion.",
  "Lighter gives the flywheel a public leverage venue.",
];

const faq = [
  {
    question: "What is Hood3?",
    answer: "$HOOD3 is a Robinhood Chain native leverage token designed around a public HOOD long on Lighter.",
  },
  {
    question: "Where do fees go?",
    answer: "The 2% creator fee is designed to build the HOOD position, subject to execution, risk controls, and operating conditions.",
  },
  {
    question: "What happens if the long wins?",
    answer: "Qualifying realized profit can market-buy $HOOD3 and permanently burn it.",
  },
  {
    question: "Guaranteed?",
    answer: "No. Leveraged positions can lose money or get liquidated. Buybacks only happen when qualifying realized profits exist.",
  },
];

export default function Home() {
  return (
    <main className="site-shell hood3-shell hood3-terminal-site">
      <SiteHeader />
      <Hood3SignalField />

      <section className="hood-section hood-hero" id="buy-hood3">
        <div className="hood-hero__copy">
          <p className="eyebrow">Robinhood Chain native leverage</p>
          <h1>
            THE LEVERAGED BET
            <span>ON HOOD.</span>
          </h1>
          <div className="hero-copy-lines">
            <p>Powered by Lighter.</p>
            <p>2% creator fees build a public HOOD long. Realized profits buy back and burn $HOOD3.</p>
          </div>
          <div className="hero-actions meme-actions">
            <Link className="button primary long-button" href="#buy-hood3">
              Buy $HOOD3
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button ghost long-button" href="/dashboard">
              View The Long
            </Link>
          </div>
          <p className="hero-ca">CA: soon on Robinhood Chain</p>
        </div>

        <div className="hood-hero__mark" aria-hidden="true">
          <Image src="/hood3-logo.png" alt="" width={1280} height={1195} priority />
          <span>LIGHTER</span>
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
        <div className="section-label">ROBINHOOD CHAIN</div>
        <h2>HOOD3 TURNS RETAIL FLOW INTO DIRECTIONAL HOOD EXPOSURE.</h2>
        <div className="origin-grid hood-origin-grid">
          <div className="origin-board">
            <span>01</span>
            <strong>Robinhood Chain</strong>
            <p>Hood3 is built for the Robinhood-native onchain era: familiar retail culture, faster rails, and public receipts.</p>
          </div>
          <div className="origin-board">
            <span>02</span>
            <strong>Lighter execution</strong>
            <p>The mechanism is designed to route creator fees into a transparent HOOD long on Lighter.</p>
          </div>
        </div>
      </section>

      <section className="hood-section mechanic-section" id="mechanism">
        <div className="section-label">MECHANISM</div>
        <h2>FEES LONG HOOD. PROFITS BURN $HOOD3.</h2>
        <div className="long-flow">
          {flow.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <p className="mechanism-note">Not yield. Not a payout. A transparent, highly risky directional flywheel.</p>
      </section>

      <section className="hood-section thesis-section" id="hood-thesis">
        <div className="section-label">WHY HOOD?</div>
        <h2>THE ROBINHOOD BET NEEDS A ROBINHOOD LONG.</h2>
        <div className="thesis-tape">
          {thesis.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="thesis-closing">
          IF HOOD WINS,
          <br />
          HOOD3 GETS SCARCER.
        </p>
        <a className="button ghost long-button" href={hoodChartUrl}>
          View HOOD
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="hood-section terminal-section" id="live-position">
        <div className="section-label">LIVE LONG</div>
        <h2>THE LIGHTER POSITION UPDATES IN PUBLIC.</h2>
        <div className="terminal-strip">
          <span>POSITION SIZE</span>
          <strong>Awaiting live integration.</strong>
          <span>REALIZED PROFIT</span>
          <strong>Awaiting live integration.</strong>
          <span>LAST POSITION UPDATE</span>
          <strong>AWAITING FIRST LIGHTER RECEIPT</strong>
        </div>
        <div className="button-row">
          <Link className="button primary long-button" href="/dashboard">
            Verify Position
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link className="button ghost long-button" href="/dashboard">
            Hood3 Terminal
          </Link>
        </div>
      </section>

      <section className="hood-section burn-section" id="burns">
        <div>
          <p className="section-label">BUYBACKS AND BURNS</p>
          <h2>REALIZED PROFITS BUY BACK AND BURN $HOOD3.</h2>
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
