import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { hood3XUrl, sourceLinks } from "../data";

const navLinks = [
  { label: "Robinhood Chain", href: "/#origin" },
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
        <Link className="brand" href="/" aria-label="Hood3 home">
          <span className="brand-mark hood3-brand-mark" aria-hidden="true">
            <Image src="/hood3-logo.png" alt="" width={1280} height={1195} />
          </span>
          <span>
            <strong>HOOD3</strong>
            <small>$HOOD3</small>
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
          <a className="social-link x-header-link" href={hood3XUrl} target="_blank" rel="noreferrer" aria-label="Open Hood3 on X">
            X
            <ExternalLink size={13} aria-hidden="true" />
          </a>
          <Link className="nav-cta" href="/#buy-hood3">
            Buy $HOOD3
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
        <strong>HOOD3</strong>
        <span>The leveraged bet on HOOD, powered by Lighter.</span>
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
        $HOOD3 is a highly speculative community token. Leveraged trading can result in partial or total loss,
        including liquidation. Nothing on this website is financial advice. $HOOD3 is not affiliated with Robinhood
        Markets, Lighter, HOOD, or any referenced third party.
      </p>
    </footer>
  );
}
