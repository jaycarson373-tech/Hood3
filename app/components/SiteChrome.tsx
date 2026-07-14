import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import {
  hood3ContractAddress,
  hood3HyperliquidAccount,
  hood3HyperliquidAccountShort,
  hood3HyperliquidScanUrl,
  hood3XUrl,
  sourceLinks,
  topMetrics,
} from "../data";

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
          <div
            className="contract-chip"
            title={hood3ContractAddress}
            aria-label={`Contract address ${hood3ContractAddress}`}
          >
            <span>CA</span>
            <code>{hood3ContractAddress}</code>
          </div>
          <a
            className="account-link"
            href={hood3HyperliquidScanUrl}
            target="_blank"
            rel="noreferrer"
            title={hood3HyperliquidAccount}
            aria-label={`View Hood3 Hyperliquid account ${hood3HyperliquidAccount} on HypurrScan`}
          >
            <span>HL</span>
            <code>{hood3HyperliquidAccountShort}</code>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <a className="social-link" href={hood3XUrl} target="_blank" rel="noreferrer" aria-label="Open Hood3 on X">
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
