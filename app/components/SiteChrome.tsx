import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  ANSEM,
  BBL_CONTRACT_ADDRESS,
  EXTERNAL_LINKS,
  externalLinks,
} from "../constants";
import { HeaderContract } from "./HeaderContract";

const navLinks = [
  { label: "Flywheel", href: "/#mechanism" },
  { label: "Bull Lore", href: "/thesis" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Burns", href: "/#burns" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="main-nav">
        <Link className="brand" href="/" aria-label="BBL home">
          <span className="brand-mark" aria-hidden="true">
            <Image
              src="/bbl-logo.jpg"
              alt=""
              width={1280}
              height={1280}
              sizes="42px"
              priority
            />
          </span>
          <span className="brand-copy">
            <strong>BBL</strong>
            <small>BLACK BULL LONG</small>
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
          {EXTERNAL_LINKS.x ? (
            <a
              className="social-link"
              href={EXTERNAL_LINKS.x}
              target="_blank"
              rel="noreferrer"
              aria-label="Open BBL on X"
            >
              X
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ) : null}
          {BBL_CONTRACT_ADDRESS ? (
            <HeaderContract address={BBL_CONTRACT_ADDRESS} />
          ) : (
            <Link className="header-dashboard-link" href="/dashboard">
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <strong>BBL</strong>
          <span>Black Bull Long.</span>
        </div>
        <div className="source-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/thesis">Bull Lore</Link>
          <a href={ANSEM.dexScreenerUrl} target="_blank" rel="noreferrer">
            ANSEM Market
            <ExternalLink size={14} aria-hidden="true" />
          </a>
          {externalLinks.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
            >
              {source.label}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <p className="footer-disclaimer">
        $BBL is a highly speculative community token. ANSEM and $BBL can
        lose substantial or total value. Buybacks and burns require qualifying
        realized profits and are not guaranteed. Nothing here is financial
        advice. BBL is independent and is not affiliated with or endorsed by
        Ansem, The Black Bull, Aster, or any launchpad.
      </p>
    </footer>
  );
}
