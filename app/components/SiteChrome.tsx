import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  publicPositionAccount,
  publicPositionAccountShort,
  publicPositionScanUrl,
  sourceLinks,
} from "../data";

const navLinks = [
  { label: "Mechanism", href: "/#mechanism" },
  { label: "Thesis", href: "/thesis" },
  { label: "The Long", href: "/dashboard" },
  { label: "Burns", href: "/#burns" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="main-nav longcat-nav">
        <Link className="brand" href="/" aria-label="Longcat home">
          <span className="brand-mark longcat-brand-mark" aria-hidden="true">
            <span className="brand-cat" />
          </span>
          <span>
            <strong>LONGCAT</strong>
            <small>still going</small>
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
