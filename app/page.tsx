import Link from "next/link";
import { ArrowRight, Flame, LineChart, ShieldCheck, StretchHorizontal } from "lucide-react";
import {
  burnStats,
  cashcatChartUrl,
  cashcatThesisPoints,
  faqItems,
  flywheelSteps,
  landingStats,
  livePositionStats,
  timeline,
} from "./data";
import { LongcatBackground, LongcatMascot, MetricGrid } from "./components/LongcatVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const burnRows: Array<{
  date: string;
  profit: string;
  purchased: string;
  burned: string;
  transaction: string;
}> = [];

export default function Home() {
  return (
    <main className="site-shell longcat-shell">
      <SiteHeader />
      <LongcatBackground />

      <section className="landing-hero longcat-hero" id="buy-longcat">
        <div className="landing-content">
          <p className="eyebrow">THE NATIVE LEVERAGE TOKEN FOR CASHCAT</p>
          <h1>
            THE LONGEST LONG{" "}
            <span>ON ROBINHOOD.</span>
          </h1>
          <p className="hero-power">Every fee makes the long longer.</p>
          <p className="hero-lede">
            Every creator fee extends one public leveraged long on $CASHCAT. When the trade generates realized profit,
            the profit buys back and permanently burns $LONGCAT. The longer we trade, the longer the long becomes.
          </p>
          <p className="hero-flow">
            {
              "$LONGCAT trades -> creator fees accumulate -> fees extend the public $CASHCAT long -> realized gains buy back $LONGCAT -> tokens burn -> repeat"
            }
          </p>

          <div className="hero-actions">
            <Link className="button primary" href="#buy-longcat">
              BUY $LONGCAT
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button ghost dark" href="/dashboard">
              VIEW THE LONG
            </Link>
          </div>
          <p className="hero-close">Public. Verifiable. Permanently directional.</p>
        </div>

        <div className="longcat-hero-art">
          <LongcatMascot />
        </div>

        <div className="hero-command terminal-card">
          <span>LIVE TERMINAL</span>
          <strong>Awaiting first integration</strong>
          <small>No fabricated live values. Placeholders stay flat until data connects.</small>
        </div>
      </section>

      <section className="landing-stat-row longcat-stat-row" aria-label="Longcat live placeholders">
        {landingStats.map((stat) => (
          <div className="landing-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        ))}
      </section>

      <section className="content-band meme-section">
        <div>
          <p className="eyebrow">The meme becomes the mechanism</p>
          <h2>LONGCAT WAS ALWAYS TELLING US WHAT TO DO.</h2>
        </div>
        <div className="meme-copy">
          <p>
            In 2005, the internet met Shiro, the rescue cat from Japan whose impossibly long body became one of the
            web&apos;s earliest legendary memes.
          </p>
          <strong>Her entire message was simple: Looooooooooooooooong.</strong>
          <p>
            Twenty years later, we are taking it literally. $LONGCAT turns every creator fee into additional exposure
            to Cashcat, creating one expanding, publicly visible long position.
          </p>
        </div>
      </section>

      <section className="content-band longcat-timeline" aria-label="Longcat timeline">
        {timeline.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="content-band flywheel-section" id="mechanism">
        <div className="section-heading">
          <span className="icon-chip">
            <StretchHorizontal size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">The flywheel</p>
            <h2>EVERY FEE MAKES THE LONG LONGER.</h2>
          </div>
        </div>

        <div className="horizontal-flow">
          {flywheelSteps.map((step) => (
            <article className="flow-step" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="mechanism-line">
          <strong>Fees create exposure.</strong>
          <strong>Winning trades create scarcity.</strong>
          <small>Buybacks are not guaranteed. They only occur when qualifying realized profits exist.</small>
        </div>
      </section>

      <section className="content-band cashcat-section" id="cashcat-thesis">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Cashcat thesis</p>
            <h2>WHY CASHCAT?</h2>
          </div>
          <p>The native cat of Robinhood deserves the longest position on Robinhood.</p>
        </div>

        <div className="thesis-grid">
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
        </div>

        <div className="cashcat-quote">
          <strong>IF ROBINHOOD BECOMES THE HOME OF RETAIL, CASHCAT CAN BECOME ITS CAT.</strong>
          <div className="chart-placeholder" id="chart">
            <LineChart size={34} aria-hidden="true" />
            <span>CASHCAT chart placeholder</span>
            <small>Awaiting market data integration.</small>
            <a className="button primary" href={cashcatChartUrl}>
              VIEW CASHCAT
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="content-band live-long-section" id="live-position">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Live long</p>
            <h2>ONE POSITION. EXTENDING IN PUBLIC.</h2>
          </div>
          <p>Placeholder values remain clearly marked until the Cashcat position feed is connected.</p>
        </div>
        <MetricGrid metrics={livePositionStats} className="terminal-metric-grid" />
        <div className="button-row">
          <Link className="button primary" href="/dashboard">
            VERIFY POSITION
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button ghost" href="/dashboard">
            VIEW TRANSACTIONS
          </Link>
        </div>
      </section>

      <section className="content-band burns-section" id="burns">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Buybacks and burns</p>
            <h2>
              WHEN THE LONG WINS,
              <span>LONGCAT GETS SHORTER.</span>
            </h2>
          </div>
          <p>
            Realized profits from the Cashcat position are used to market-buy $LONGCAT. Every purchased token is
            permanently burned.
          </p>
        </div>

        <MetricGrid metrics={burnStats} className="burn-metric-grid" />

        <div className="burn-table">
          <div className="table-head">
            <span>Date</span>
            <span>Cashcat Profit</span>
            <span>$LONGCAT Purchased</span>
            <span>Tokens Burned</span>
            <span>Transaction</span>
          </div>
          {burnRows.length ? (
            burnRows.map((row) => (
              <div className="table-row five-col" key={`${row.date}-${row.transaction}`}>
                <span>{row.date}</span>
                <span>{row.profit}</span>
                <span>{row.purchased}</span>
                <span>{row.burned}</span>
                <span>{row.transaction}</span>
              </div>
            ))
          ) : (
            <div className="empty-row">
              Burn history will appear here after realized Cashcat profit buys and burns $LONGCAT.
            </div>
          )}
        </div>
      </section>

      <section className="content-band dual-visual-section">
        <div className="dual-panel dual-panel--long">
          <p className="eyebrow">CASHCAT EXPOSURE UP</p>
          <h2>THE POSITION GETS LONGER.</h2>
          <LongcatMascot variant="line" />
        </div>
        <div className="dual-panel dual-panel--short">
          <p className="eyebrow">$LONGCAT SUPPLY DOWN</p>
          <h2>THE SUPPLY GETS SHORTER.</h2>
          <div className="supply-ring" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="content-band manifesto-section">
        <p className="eyebrow">Manifesto</p>
        <h2>65 CENTIMETRES OF PURE DIRECTIONAL CONVICTION.</h2>
        <p>
          Longcat was never sideways. She did not hedge. She did not diversify. She stretched in one direction and
          became immortal.
        </p>
        <strong>
          One meme.
          <br />
          One position.
          <br />
          One direction.
        </strong>
        <span>Looooooooooooooooong.</span>
      </section>

      <section className="content-band faq-section" id="faq">
        <div className="section-heading">
          <span className="icon-chip">
            <ShieldCheck size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">FAQ</p>
            <h2>Clear mechanics. No guarantees.</h2>
          </div>
        </div>
        <div className="faq-grid">
          {faqItems.map((item) => (
            <article className="faq-item" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band compliance-strip">
        <div>
          <Flame size={18} aria-hidden="true" />
          <span>The Cashcat position gets longer. The $LONGCAT supply gets shorter.</span>
        </div>
        <div>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>No income claim, no payout promise, no guaranteed outcome.</span>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
