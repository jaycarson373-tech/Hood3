import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  publicPositionAccount,
  publicPositionAccountShort,
  publicPositionScanUrl,
  sourceLinks,
  topMetrics,
} from "../data";

const navLinks = [
  { label: "Mechanism", href: "/#mechanism" },
  { label: "Cashcat Thesis", href: "/thesis" },
  { label: "Live Position", href: "/dashboard" },
  { label: "Burns", href: "/#burns" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const conveyorMetrics = [...topMetrics, ...topMetrics];

  return (
    <header className="site-header">
      <div className="market-strip" aria-label="Longcat live mechanism snapshot">
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

      <div className="main-nav longcat-nav">
        <Link className="brand" href="/" aria-label="Longcat home">
          <span className="brand-mark longcat-brand-mark" aria-hidden="true">
            <span className="brand-cat" />
          </span>
          <span>
            <strong>LONGCAT</strong>
            <small>The longest long</small>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <a
            className="account-link"
            href={publicPositionScanUrl}
            target="_blank"
            rel="noreferrer"
            title={publicPositionAccount}
            aria-label={`View Longcat public position account ${publicPositionAccountShort}`}
          >
            <span>LONG</span>
            <code>{publicPositionAccountShort}</code>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          <Link className="nav-cta" href="/#buy-longcat">
            Buy $LONGCAT
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer longcat-footer">
      <div>
        <strong>LONGCAT</strong>
        <span>The longest long on Robinhood.</span>
      </div>
      <div className="source-links">
        {sourceLinks.map((source) => (
          <a key={source.href} href={source.href} target={source.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
            {source.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
      <p>
        $LONGCAT is a highly speculative community token. Leveraged trading can result in partial or total loss,
        including liquidation. Nothing on this website is financial advice. $LONGCAT is not affiliated with Robinhood
        Markets, Cashcat, Shiro, Longcat&apos;s original creators or any referenced third party.
      </p>
    </footer>
  );
}
