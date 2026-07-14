import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { sourceLinks, topMetrics } from "../data";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="market-strip" aria-label="Hood3 live desk snapshot">
        {topMetrics.map((metric) => (
          <div className="market-strip__item" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </div>

      <div className="main-nav">
        <Link className="brand" href="/" aria-label="Hood3 home">
          <span className="brand-mark">
            <Image src="/hood3-logo.png" alt="" width={1248} height={1086} priority />
          </span>
          <span>
            <strong>Hood3</strong>
            <small>HOODX native leverage</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/thesis">Hood Thesis</Link>
        </nav>

        <Link className="nav-cta" href="/dashboard">
          Open desk
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        Prototype only. Not investment advice, not an offer to buy or sell securities, derivatives, crypto assets, or
        HOODX/NLT tokens. Perpetuals and leverage can lose money quickly.
      </p>
      <div className="source-links">
        {sourceLinks.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
            {source.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
    </footer>
  );
}
