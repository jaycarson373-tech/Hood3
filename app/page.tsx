import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cashcatChartUrl, publicPositionScanUrl } from "./data";
import { LongChart, LongcatSpine, SupplyShrink } from "./components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const lengthStats = [
  { label: "Current Length", value: "Loooooooooooooooooooooooong", detail: "measured emotionally" },
  { label: "Cat Extension Today", value: "+1.42 metres", detail: "placeholder until live" },
  { label: "Current Long", value: "$0", detail: "awaiting first position" },
  { label: "Burned", value: "0", detail: "tail still attached" },
];

const originUrl = "https://amp.knowyourmeme.com/memes/longcat";

const flow = [
  "$LONGCAT trades",
  "fees extend $CASHCAT",
  "winning trades buy back",
  "tokens burn",
  "cat continues",
];

const thesis = [
  "Robinhood brings retail onchain.",
  "Retail understands cats.",
  "Cashcat is the cat.",
  "$LONGCAT makes the bet absurdly long.",
];

const faq = [
  {
    question: "What is this?",
    answer: "$LONGCAT is the longest long on Robinhood. Creator fees extend one public $CASHCAT long.",
  },
  {
    question: "Where do fees go?",
    answer: "Fees are designed to extend the Cashcat position, subject to execution, risk controls, and reality.",
  },
  {
    question: "What happens if the long wins?",
    answer: "Realized profit can market-buy $LONGCAT and permanently burn it. No win, no magic.",
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
          <p className="meme-kicker">LONGCAT // ROBINHOOD CHAIN // STATUS: EXTENDING</p>
          <h1>THE LONGEST LONG.</h1>
          <p className="meme-subtitle">Every fee makes the cat longer.</p>
          <div className="hero-actions meme-actions">
            <Link className="button primary long-button" href="#buy-longcat">
              Buy Longcat
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="button ghost long-button" href="/dashboard">
              View The Long
            </Link>
          </div>
        </div>

      </section>

      <section className="cat-section length-section" aria-label="Live length">
        <div className="section-label">LIVE LENGTH</div>
        <div className="length-grid">
          {lengthStats.map((stat) => (
            <article key={stat.label} className="length-stat">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="cat-section shout-section">
        <span className="meme-word">LONG.</span>
        <span className="meme-word">LONGER.</span>
        <span className="meme-word">LONGEST.</span>
        <p>tail not found</p>
      </section>

      <section className="cat-section origin-section" id="origin">
        <div className="section-label">ORIGIN LORE</div>
        <h2>BEFORE THE LONG WAS A POSITION, THE LONG WAS A CAT.</h2>
        <div className="origin-board">
          <span>2004-2005</span>
          <strong>Futaba / 2chan</strong>
          <p>
            A white cat named Shiroi, also known as Nobiko, gets stretched into internet history. The instruction was
            not complicated.
          </p>
          <em>Looooooooooooooooong.</em>
        </div>
        <a className="button ghost long-button" href={originUrl} target="_blank" rel="noreferrer">
          Know Your Meme
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="cat-section mechanic-section" id="mechanism">
        <div className="section-label">MECHANIC</div>
        <h2>EVERY FEE EXTENDS THE CAT.</h2>
        <div className="long-flow">
          {flow.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
        <p className="microcopy">Every winning trade burns supply. Every losing trade is why disclaimers exist.</p>
      </section>

      <section className="cat-section chart-meme-section">
        <div>
          <p className="meme-kicker">CURRENT LONG</p>
          <h2>$CASHCAT</h2>
          <strong>Looooooooooooooooong</strong>
        </div>
        <LongChart />
      </section>

      <section className="cat-section thesis-section" id="cashcat-thesis">
        <div className="section-label">WHY CASHCAT?</div>
        <h2>THE NATIVE CAT OF ROBINHOOD DESERVES THE LONGEST POSITION ON ROBINHOOD.</h2>
        <div className="thesis-tape">
          {thesis.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <a className="button ghost long-button" href={cashcatChartUrl}>
          View Cashcat
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </section>

      <section className="cat-section one-direction-section">
        <h2>
          ONE CAT.
          <br />
          ONE LONG.
          <br />
          ONE DIRECTION.
        </h2>
        <p>Looooooooooooooooooooooooooooooooooooooooooooong.</p>
      </section>

      <section className="cat-section terminal-section" id="live-position">
        <div className="section-label">LIVE LONG</div>
        <h2>POSITION EXTENDING IN PUBLIC.</h2>
        <div className="terminal-strip">
          <span>CASHCAT LONG</span>
          <strong>$0</strong>
          <span>LEVERAGE</span>
          <strong>0.00x</strong>
          <span>STATUS</span>
          <strong>AWAITING FIRST LONG</strong>
        </div>
        <div className="button-row">
          <a className="button primary long-button" href={publicPositionScanUrl} target="_blank" rel="noreferrer">
            Verify Position
            <ExternalLink size={16} aria-hidden="true" />
          </a>
          <Link className="button ghost long-button" href="/dashboard">
            Terminal
          </Link>
        </div>
      </section>

      <section className="cat-section burn-section" id="burns">
        <div>
          <p className="section-label">WHEN THE LONG WINS</p>
          <h2>LONGCAT GETS SHORTER.</h2>
          <p className="microcopy">Realized profit buys. Bought tokens burn. Supply disappears.</p>
        </div>
        <SupplyShrink />
      </section>

      <section className="cat-section faq-section meme-faq" id="faq">
        <div className="section-label">FAQ BUT MAKE IT LONG</div>
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
