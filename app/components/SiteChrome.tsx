import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  EXTERNAL_LINKS,
  HEDGE_CONTRACT_ADDRESS,
  externalLinks,
} from "../constants";
import { HeaderContract } from "./HeaderContract";

const navLinks = [
  { label: "Strategy", href: "/#strategy" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "PFP Studio", href: "/#pfp-studio" },
  { label: "Transparency", href: "/#transparency" },
  { label: "Roadmap", href: "/#roadmap" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="main-nav">
        <Link className="brand" href="/" aria-label="Hedge the Hedgehog home">
          <span className="brand-mark">
            <Image
              src="/hedge-logo.jpg"
              alt="Hedge the Hedgehog"
              width={1254}
              height={1254}
              sizes="44px"
              priority
            />
          </span>
          <span className="brand-copy">
            <strong>HEDGE</strong>
            <small>THE HEDGEHOG</small>
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
          <HeaderContract address={HEDGE_CONTRACT_ADDRESS} />
          <a
            className="header-buy-link"
            href={EXTERNAL_LINKS.buy}
            target="_blank"
            rel="noreferrer"
          >
            Buy $HEDGE
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-masthead">
        <div>
          <strong>HEDGE</strong>
          <span>THE HEDGEHOG</span>
        </div>
        <p>The first perpetual hedge fund on Solana.</p>
      </div>
      <div className="footer-grid">
        <div>
          <span className="footer-label">OFFICE</span>
          <p>Wall Street discipline.<br />Solana settlement.<br />Hedgehog management.</p>
        </div>
        <nav className="source-links" aria-label="External links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/thesis">Mandate</Link>
          {externalLinks.map((source) => (
            <a
              key={`${source.label}-${source.href}`}
              href={source.href}
              target="_blank"
              rel="noreferrer"
            >
              {source.label}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          ))}
        </nav>
      </div>
      <p className="footer-disclaimer">
        $HEDGE is a highly speculative community token. Perpetual trading can
        result in partial or total loss, including liquidation. Buybacks and
        burns require qualifying realized profits and are not guaranteed.
        Nothing on this website is financial advice.
      </p>
    </footer>
  );
}
