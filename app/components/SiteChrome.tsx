import Link from "next/link";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { CONTRACT_ADDRESS, EXTERNAL_LINKS, externalLinks } from "../constants";
import { HeaderContract } from "./HeaderContract";

const navLinks = [
  { label: "Mechanism", href: "/#mechanism" },
  { label: "Thesis", href: "/thesis" },
  { label: "The Long", href: "/dashboard" },
  { label: "Burns", href: "/#burns" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const hasActions = Boolean(EXTERNAL_LINKS.x || CONTRACT_ADDRESS);

  return (
    <header className="site-header">
      <div className="main-nav launch-nav">
        <Link className="brand" href="/" aria-label="Longcat home">
          <span className="brand-mark launch-brand-mark" aria-hidden="true">
            <Image src="/longcat-logo.png" alt="" width={512} height={512} sizes="44px" priority unoptimized />
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

        {hasActions ? (
          <div className="header-actions">
            {EXTERNAL_LINKS.x ? (
              <a className="social-link x-header-link" href={EXTERNAL_LINKS.x} target="_blank" rel="noreferrer" aria-label="Open Longcat on X">
                X
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            ) : null}
            {CONTRACT_ADDRESS ? <HeaderContract address={CONTRACT_ADDRESS} /> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer launch-footer">
      <div className="footer-brand">
        <strong>LONGCAT</strong>
        <span>The longest cat on Solana.</span>
      </div>
      <div className="source-links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/thesis">Thesis</Link>
        <Link href="/#burns">Burns</Link>
        {externalLinks.map((source) => (
          <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
            {source.label}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        ))}
      </div>
      <p className="footer-disclaimer">
        $LONGCAT is a highly speculative community token. Leveraged trading can result in partial or total loss,
        including liquidation. Nothing on this website is financial advice. $LONGCAT is not affiliated with Solana
        Foundation, Hyperliquid, or any referenced third party.
      </p>
    </footer>
  );
}
