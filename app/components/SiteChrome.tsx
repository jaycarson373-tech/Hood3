import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { sourceLinks, topMetrics } from "../data";

const contractAddress = "E5GgVo7dLPUgebUrNLDR6tWVWktgo74a2FfEJmrtpump";
const xUrl = "https://x.com/HOOD3pf";

export function SiteHeader() {
  const conveyorMetrics = [...topMetrics, ...topMetrics];

  return (
    <header className="site-header">
      <div className="market-strip" aria-label="Hood3 live desk snapshot">
        <div className="market-strip__track">
          {conveyorMetrics.map((metric, index) => (
            <div className="market-strip__item" key={`${metric.label}-${index}`}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="main-nav">
        <Link className="brand" href="/" aria-label="Hood3 home">
          <span className="brand-mark">
            <Image src="/hood3-logo.png" alt="" width={1248} height={1086} priority />
          </span>
          <span>
            <strong>Hood3</strong>
            <small>NLT flywheel</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/thesis">Hood Thesis</Link>
        </nav>

        <div className="header-actions">
          <div className="contract-chip" title={contractAddress} aria-label={`Contract address ${contractAddress}`}>
            <span>CA</span>
            <code>{contractAddress}</code>
          </div>
          <a className="social-link" href={xUrl} target="_blank" rel="noreferrer" aria-label="Open Hood3 on X">
            X
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <Link className="nav-cta" href="/dashboard">
            Open desk
          </Link>
        </div>
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
