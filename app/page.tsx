import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { ANSEM, EXTERNAL_LINKS } from "./constants";
import { HeroTerminal } from "./components/HeroTerminal";
import { MarketStrip } from "./components/MarketStrip";
import {
  BullBackdrop,
  BullSignalStack,
} from "./components/BullVisuals";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const flow = [
  "$BBL trades",
  "creator fees collect",
  "ANSEM 5x long grows",
  "profit is realized",
  "$BBL gets bought",
  "$BBL gets burned",
];

const faq = [
  {
    question: "What is BBL?",
    answer:
      "BBL means Black Bull Long: a community token designed to turn creator fees into a public ANSEMUSDT 5x long.",
  },
  {
    question: "Where do creator fees go?",
    answer:
      "The system is designed to route creator fees into managed collateral for an ANSEMUSDT 5x long on Aster, subject to execution and risk limits.",
  },
  {
    question: "What happens when profit is realized?",
    answer:
      "Qualifying realized profit may market-buy $BBL and permanently burn the purchased tokens.",
  },
  {
    question: "Are buybacks guaranteed?",
    answer:
      "No. ANSEM can lose value, execution can fail, and buybacks only occur when qualifying realized profits exist.",
  },
];

export default function Home() {
  return (
    <main className="site-shell bbl-site">
      <SiteHeader />
      <BullBackdrop />

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">THE BLACK BULL FLYWHEEL</p>
          <h1>
            BLACK BULL
            <span>LONG.</span>
          </h1>
          <div className="hero-lines">
            <p>
              Creator fees build one public <strong>ANSEM</strong> position.
            </p>
            <p>
              Qualifying realized profits buy back and burn{" "}
              <strong>$BBL</strong>.
            </p>
          </div>
          <p className="hero-joke">Built from the back end.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/dashboard">
              Enter Dashboard
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              className="button ghost"
              href={ANSEM.asterMarketUrl}
              target="_blank"
              rel="noreferrer"
            >
              View on Aster
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
          <MarketStrip />
        </div>

        <div className="hero-visual">
          <div className="hero-bull">
            <Image
              src="/bbl-logo.jpg"
              alt="A rear-facing Black Bull looking over its shoulder"
              width={1280}
              height={1280}
              priority
              sizes="(max-width: 760px) 94vw, 52vw"
            />
            <span className="bull-caption">FULLY REAR-ALIGNED</span>
          </div>
          <HeroTerminal />
        </div>
      </section>

      <section className="brand-banner-section" aria-label="Black Bull Long">
        <Image
          src="/bbl-banner.jpg"
          alt="Black Bull Long, powered by the ANSEM long flywheel"
          width={1280}
          height={426}
          sizes="100vw"
        />
      </section>

      <section className="mechanism-section section-band" id="mechanism">
        <div className="section-heading">
          <p className="eyebrow">THE MECHANISM</p>
          <h2>FEES BACK THE BULL.</h2>
          <p>
            One direction. Public receipts. No imaginary yield.
          </p>
        </div>
        <div className="flywheel-flow">
          {flow.map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              {index < flow.length - 1 ? (
                <ArrowRight size={17} aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
        <p className="mechanism-note">
          Fees create exposure. Qualifying wins create scarcity.
        </p>
      </section>

      <section className="lore-section section-band" id="lore">
        <div className="ansem-mark">
          <Image
            src="/ansem-token.jpg"
            alt="The Black Bull ANSEM token mark"
            width={800}
            height={800}
            sizes="(max-width: 700px) 90vw, 420px"
          />
          <span>THE ASSET BEHIND THE BULL</span>
        </div>
        <div className="lore-copy">
          <p className="eyebrow">BLACK BULL LORE</p>
          <h2>CONVICTION BECAME A CHARACTER.</h2>
          <p>
            Ansem became one of Solana&apos;s loudest directional traders.
            His early WIF call became part of Crypto Twitter lore. The market
            turned that posture into a name: <strong>the Black Bull.</strong>
          </p>
          <p>
            A community-launched ANSEM token then made the identity liquid.
            BBL is an independent satire built around the same simple instinct:
            when the bull charges, build the position.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/thesis">
              Read the Lore
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              className="text-link"
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

      <section className="meme-section section-band">
        <p>THE BULL FACES FORWARD.</p>
        <h2>THE FLYWHEEL HANDLES THE REAR.</h2>
        <ArrowDownRight size={48} aria-hidden="true" />
      </section>

      <section className="burn-section section-band" id="burns">
        <div>
          <p className="eyebrow">BUYBACKS + BURNS</p>
          <h2>
            THE POSITION GETS BIGGER.
            <br />
            THE SUPPLY GETS SMALLER.
          </h2>
          <p>
            Only qualifying realized ANSEM profit can fund $BBL buybacks.
            Every completed burn must be published with a transaction receipt.
          </p>
          <Link className="button ghost" href="/dashboard">
            Verify Receipts
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <BullSignalStack />
      </section>

      <section className="faq-section section-band" id="faq">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>BULL, EXPLAINED.</h2>
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

      {EXTERNAL_LINKS.buy ? (
        <section className="final-cta section-band">
          <p>ONE BULL. ONE LONG. ONE FLYWHEEL.</p>
          <a
            className="button primary"
            href={EXTERNAL_LINKS.buy}
            target="_blank"
            rel="noreferrer"
          >
            Buy $BBL
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
