import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { hood3XUrl, sourceLinks } from "../data";

const navLinks = [
  { label: "Solana Thesis", href: "/#origin" },
  { label: "Mechanism", href: "/#mechanism" },
  { label: "Thesis", href: "/thesis" },
  { label: "The Long", href: "/dashboard" },
  { label: "Burns", href: "/#burns" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="main-nav hood3-nav">
        <Link className="brand" href="/" aria-label="Longcat home">
          <span className="brand-mark hood3-brand-mark" aria-hidden="true">
            <Image src="/longcat-logo.png" alt="" width={1024} height={1024} />
          </span>
          <span>
            <strong>LONGCAT</strong>
            <small>$LONGCAT</small>
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
          <a className="social-link x-header-link" href={hood3XUrl} target="_blank" rel="noreferrer" aria-label="Open Longcat on X">
            X
            <ExternalLink size={13} aria-hidden="true" />
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
    <footer className="site-footer hood3-footer">
      <div>
        <strong>LONGCAT</strong>
        <span>The longest cat on Solana.</span>
      </div>
      <div className="footer-market-strip" aria-label="Longcat market prices">
        <div>
          <span>SOL PRICE</span>
          <strong>Awaiting live integration.</strong>
        </div>
        <div>
          <span>$LONGCAT PRICE</span>
          <strong>Awaiting launch.</strong>
        </div>
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
        including liquidation. Nothing on this website is financial advice. $LONGCAT is not affiliated with Solana
        Foundation, Hyperliquid, or any referenced third party.
      </p>
    </footer>
  );
}
