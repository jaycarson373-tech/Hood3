"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  ExternalLink,
  Link2,
  ListChecks,
  RefreshCcw,
  ShieldCheck,
  Terminal,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import {
  automationSteps,
  burnStats,
  howItWorks,
  lighterUrl,
  livePositionStats,
  terminalEvents,
} from "../data";
import { LongcatScrollBackdrop, MetricGrid } from "../components/LongcatVisuals";

type LoadState = "idle" | "loading" | "linked" | "error";

type HyperliquidPosition = {
  position?: {
    coin?: string;
    szi?: string;
    positionValue?: string;
    unrealizedPnl?: string;
  };
};

type HyperliquidAccount = {
  marginSummary?: {
    accountValue?: string;
    totalNtlPos?: string;
    totalMarginUsed?: string;
  };
  crossMarginSummary?: {
    accountValue?: string;
    totalNtlPos?: string;
    totalMarginUsed?: string;
  };
  assetPositions?: HyperliquidPosition[];
};

type NormalizedPosition = {
  coin: string;
  size: number;
  notional: number;
  pnl: number;
};

type SupabaseTerminalRow = {
  id: number;
  created_at: string;
  stage: string;
  status: string;
  action: string;
  message: string | null;
  asset: string | null;
  amount: string | number | null;
  tx_hash: string | null;
  scan_url: string | null;
};

type SupabasePositionRow = {
  recorded_at: string;
  hyperliquid_account: string;
  market: string;
  side: string;
  size: string | number;
  notional_usdc: string | number;
  entry_price: string | number | null;
  mark_price: string | number | null;
  leverage: string | number;
  unrealized_pnl_usdc: string | number;
  margin_used_usdc: string | number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const addressPattern = /^0x[a-fA-F0-9]{40}$/;

function safeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

function signedMoney(value: number) {
  const formatted = money(Math.abs(value), 2);
  return value < 0 ? `-${formatted}` : formatted;
}

function shortAddress(address: string) {
  if (!address) return "No account linked";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function terminalTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "LIVE";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizePositions(account: HyperliquidAccount | null): NormalizedPosition[] {
  return (account?.assetPositions ?? [])
    .map((item) => item.position)
    .filter(Boolean)
    .map((position) => ({
      coin: position?.coin ?? "UNKNOWN",
      size: safeNumber(position?.szi),
      notional: Math.abs(safeNumber(position?.positionValue)),
      pnl: safeNumber(position?.unrealizedPnl),
    }));
}

export function DashboardClient() {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<LoadState>("idle");
  const [message, setMessage] = useState("Awaiting public Hyperliquid account integration. Paste an address to label the dashboard locally.");
  const [account, setAccount] = useState<HyperliquidAccount | null>(null);
  const [terminalRows, setTerminalRows] = useState<SupabaseTerminalRow[]>([]);
  const [latestPosition, setLatestPosition] = useState<SupabasePositionRow | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState("Receipt feed waiting for live public events.");
  const cleanAddress = address.trim();
  const isValidAddress = addressPattern.test(cleanAddress);
  const scanUrl = isValidAddress ? lighterUrl : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedAddress = window.localStorage.getItem("longcat-hyperliquid-address");

      if (savedAddress) {
        setAddress(savedAddress);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      return;
    }

    let active = true;

    async function readSupabaseViews() {
      try {
        const headers = {
          apikey: supabaseAnonKey ?? "",
          Authorization: `Bearer ${supabaseAnonKey}`,
        };
        const [terminalResponse, positionResponse] = await Promise.all([
          fetch(`${supabaseUrl}/rest/v1/longcat_public_terminal?select=*&order=created_at.desc&limit=12`, {
            headers,
          }),
          fetch(`${supabaseUrl}/rest/v1/longcat_latest_position?select=*&market=eq.SOL&limit=1`, {
            headers,
          }),
        ]);

        if (!terminalResponse.ok || !positionResponse.ok) {
          throw new Error("Public views are not ready.");
        }

        const nextTerminalRows = (await terminalResponse.json()) as SupabaseTerminalRow[];
        const nextPositionRows = (await positionResponse.json()) as SupabasePositionRow[];

        if (!active) return;

        setTerminalRows(nextTerminalRows);
        setLatestPosition(nextPositionRows[0] ?? null);
        setSupabaseStatus("Receipt feed connected. Polling public receipts every 15 seconds.");
      } catch {
        if (!active) return;
        setSupabaseStatus("Receipt feed waiting for public receipt rows.");
      }
    }

    void readSupabaseViews();
    const timer = window.setInterval(readSupabaseViews, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const positions = useMemo(() => normalizePositions(account), [account]);
  const solPositions = positions.filter((position) => position.coin.toUpperCase().includes("SOL"));
  const supabaseLongcatLong =
    latestPosition?.side?.toLowerCase() === "long" ? Math.abs(safeNumber(latestPosition.notional_usdc)) : 0;
  const supabaseLongcatPnl = safeNumber(latestPosition?.unrealized_pnl_usdc);
  const supabasePositionRows: NormalizedPosition[] = latestPosition
    ? [
        {
          coin: latestPosition.market,
          size: safeNumber(latestPosition.size),
          notional: Math.abs(safeNumber(latestPosition.notional_usdc)),
          pnl: supabaseLongcatPnl,
        },
      ]
    : [];
  const displayedPositions = solPositions.length
    ? solPositions
    : positions.length
      ? positions.slice(0, 3)
      : supabasePositionRows;
  const liveLongcatLong = solPositions
    .filter((position) => position.size > 0)
    .reduce((sum, position) => sum + position.notional, 0);
  const liveLongcatPnl = solPositions.reduce((sum, position) => sum + position.pnl, 0);
  const accountValue = safeNumber(account?.marginSummary?.accountValue ?? account?.crossMarginSummary?.accountValue);
  const accountNotional = safeNumber(account?.marginSummary?.totalNtlPos ?? account?.crossMarginSummary?.totalNtlPos);
  const marginUsed = safeNumber(account?.marginSummary?.totalMarginUsed ?? account?.crossMarginSummary?.totalMarginUsed);

  const displayedLongNotional = liveLongcatLong > 0 ? liveLongcatLong : supabaseLongcatLong > 0 ? supabaseLongcatLong : 0;
  const displayedPnl = liveLongcatLong > 0 ? liveLongcatPnl : supabaseLongcatPnl;
  const exposureSource =
    liveLongcatLong > 0 ? "Linked SOL long" : supabaseLongcatLong > 0 ? "Supabase SOL long" : "Awaiting live integration.";
  const extensionEvents = terminalRows.filter((row) => ["BURN", "LONG", "BRIDGE", "PROFIT"].includes(row.stage.toUpperCase())).length;
  const pageExtension = Math.min(1, (terminalRows.length + extensionEvents * 2) / 36);
  const totalSolBridged = terminalRows
    .filter((row) => row.stage.toUpperCase() === "BRIDGE" && row.asset?.toUpperCase() === "SOL")
    .reduce((sum, row) => sum + safeNumber(row.amount), 0);
  const totalFeesClaimed = terminalRows
    .filter((row) => row.stage.toUpperCase() === "CLAIM" && row.asset?.toUpperCase() === "SOL")
    .reduce((sum, row) => sum + safeNumber(row.amount), 0);
  const lastFeeClaim = terminalRows.find((row) => row.stage.toUpperCase() === "CLAIM");
  const dashboardStats = livePositionStats.map((metric) => {
    if (metric.label === "POSITION SIZE") {
      return {
        ...metric,
        value: displayedLongNotional > 0 ? money(displayedLongNotional, 2) : metric.value,
      };
    }

    if (metric.label === "TOTAL SOL BRIDGED") {
      return {
        ...metric,
        value: totalSolBridged > 0 ? `${totalSolBridged.toFixed(4)} SOL` : metric.value,
      };
    }

    if (metric.label === "TOTAL FEES DEPLOYED") {
      return {
        ...metric,
        value: totalFeesClaimed > 0 ? `${totalFeesClaimed.toFixed(4)} SOL` : metric.value,
      };
    }

    if (metric.label === "UNREALIZED PNL") {
      return {
        ...metric,
        value: displayedLongNotional > 0 ? signedMoney(displayedPnl) : metric.value,
      };
    }

    if (metric.label === "LEVERAGE") {
      return {
        ...metric,
        value: safeNumber(latestPosition?.leverage) > 0 ? `${safeNumber(latestPosition?.leverage).toFixed(2)}x` : metric.value,
      };
    }

    if (metric.label === "ENTRY PRICE") {
      return {
        ...metric,
        value: safeNumber(latestPosition?.entry_price) > 0 ? money(safeNumber(latestPosition?.entry_price), 2) : metric.value,
      };
    }

    if (metric.label === "CURRENT PRICE") {
      return {
        ...metric,
        value: safeNumber(latestPosition?.mark_price) > 0 ? money(safeNumber(latestPosition?.mark_price), 2) : metric.value,
      };
    }

    if (metric.label === "LAST FEE CLAIM") {
      return {
        ...metric,
        value: lastFeeClaim ? terminalTime(lastFeeClaim.created_at) : metric.value,
      };
    }

    if (metric.label === "LAST POSITION UPDATE") {
      return {
        ...metric,
        value: latestPosition ? terminalTime(latestPosition.recorded_at) : metric.value,
      };
    }

    return metric;
  });

  async function linkAccount() {
    if (!isValidAddress) {
      setStatus("error");
      setMessage("Enter a 42-character 0x Hyperliquid account address.");
      return;
    }

    setAccount(null);
    setStatus("linked");
    setMessage("Hyperliquid account saved locally. Live Hyperliquid account reads will activate after API integration.");
    window.localStorage.setItem("longcat-hyperliquid-address", cleanAddress);
  }

  function clearAccount() {
    setAddress("");
    setAccount(null);
    setStatus("idle");
    setMessage("Awaiting public Hyperliquid account integration. Paste an address to label the dashboard locally.");
    window.localStorage.removeItem("longcat-hyperliquid-address");
  }

  return (
    <>
      <LongcatScrollBackdrop variant="dashboard" extension={pageExtension} />
      <section className="page-hero compact-page-hero">
        <p className="eyebrow">Longcat terminal</p>
        <h1>One position. Extending in public.</h1>
        <p>
          Track 15-minute claims, SOL bridged to Hyperliquid, the public SOL long, profit-taking, $LONGCAT buybacks, and burns.
        </p>
      </section>

      <section className="content-band live-long-section">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Live long</p>
            <h2>SOL position telemetry.</h2>
          </div>
          <p>Live rows appear from Supabase receipts. Until then, every value is explicitly marked as awaiting integration.</p>
        </div>
        <MetricGrid metrics={dashboardStats} className="terminal-metric-grid" />
      </section>

      <section className="dashboard-grid content-band">
        <div className="panel account-panel">
          <div className="section-heading">
            <span className="icon-chip">
              <WalletCards size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Hyperliquid account</p>
              <h2>Read-only link</h2>
            </div>
          </div>

          <div className={`status-pill ${status}`}>
            <span aria-hidden="true" />
            {status === "loading" ? "Reading account" : status === "linked" ? "Account linked" : status === "error" ? "Needs attention" : "Ready to link"}
          </div>

          <div className="scan-card public-account-card">
            <span>Longcat public Hyperliquid account</span>
            <strong>Awaiting Hyperliquid account.</strong>
            <p>The public Hyperliquid account will be published after the first verified SOL position.</p>
            <a href={lighterUrl} target="_blank" rel="noreferrer">
              Open Hyperliquid
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>

          <label className="control address-control">
            <span>Account address</span>
            <input
              value={address}
              placeholder="0x..."
              onChange={(event) => setAddress(event.target.value)}
              spellCheck={false}
            />
          </label>

          <div className="button-row">
            <button className="button primary" type="button" onClick={linkAccount} disabled={status === "loading"}>
              <Link2 size={17} aria-hidden="true" />
              Save account
            </button>
            {scanUrl ? (
              <a className="button ghost" href={scanUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={17} aria-hidden="true" />
                Open Hyperliquid
              </a>
            ) : (
              <button className="button ghost" type="button" disabled title="Enter a valid 0x wallet to open Hyperliquid">
                <ExternalLink size={17} aria-hidden="true" />
                Open Hyperliquid
              </button>
            )}
            <button className="icon-button" type="button" onClick={clearAccount} aria-label="Clear linked account">
              <RefreshCcw size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="helper-text">{message}</p>

          <div className="account-readout">
            <div>
              <span>Linked account</span>
              <strong>{shortAddress(address)}</strong>
            </div>
            <div>
              <span>Account value</span>
              <strong>{account ? money(accountValue) : "-"}</strong>
            </div>
            <div>
              <span>Total perp notional</span>
              <strong>{account ? money(accountNotional) : "-"}</strong>
            </div>
            <div>
              <span>Margin used</span>
              <strong>{account ? money(marginUsed) : "-"}</strong>
            </div>
          </div>
        </div>

        <div className="panel exposure-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip">
              <TrendingUp size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Published exposure</p>
              <h2>Current SOL long</h2>
            </div>
          </div>

          <div className="exposure-number">
            <span>{exposureSource}</span>
            <strong>{displayedLongNotional > 0 ? money(displayedLongNotional) : "Awaiting live integration."}</strong>
            <small>
              {liveLongcatLong > 0 || supabaseLongcatLong > 0
                ? `${money(displayedPnl)} unrealized PnL`
                : "Public Hyperliquid position data will appear after integration."}
            </small>
          </div>

          <div className="positions-table">
            <div className="table-head">
              <span>Coin</span>
              <span>Size</span>
              <span>Notional</span>
              <span>PnL</span>
            </div>
            {displayedPositions.map((position) => (
              <div className="table-row" key={`${position.coin}-${position.notional}-${position.size}`}>
                <span>{position.coin}</span>
                <span>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(position.size)}</span>
                <span>{money(position.notional)}</span>
                <span className={position.pnl >= 0 ? "positive" : "negative"}>{money(position.pnl)}</span>
              </div>
            ))}
            {!displayedPositions.length && (
              <div className="empty-row">
                Live SOL position rows will appear here when the public Hyperliquid account or receipt feed posts a position.
              </div>
            )}
          </div>

          <div className="disclosure">
            <ShieldCheck size={18} aria-hidden="true" />
            No private keys in the browser. Execution belongs in server-side workers.
          </div>
        </div>
      </section>

      <section className="content-band automation-section">
        <div className="section-heading">
          <span className="icon-chip">
            <ListChecks size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">Automation rail</p>
            <h2>Claims every 15 minutes.</h2>
          </div>
        </div>

        <p className="section-copy">
          The Railway worker is structured to claim fees, keep the SOL buffer, route collateral to Hyperliquid, scale the SOL long,
          take qualifying profit, bridge it back, and publish buyback plus burn receipts.
        </p>

        <div className="automation-grid">
          {automationSteps.map((step) => (
            <article className="automation-card" key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>

        <div className="terminal-panel">
          <div className="terminal-head">
            <div>
              <p className="kicker">Longcat terminal</p>
              <h2>Transaction feed.</h2>
            </div>
            <Terminal size={20} aria-hidden="true" />
          </div>
          <div className="terminal-log" aria-label="Longcat transaction terminal">
            {terminalRows.length
              ? terminalRows.map((event) => (
                  <div className="terminal-row" key={event.id}>
                    <span>{terminalTime(event.created_at)}</span>
                    <strong>{event.stage}</strong>
                    <em>{event.status.toUpperCase()}</em>
                    <p>
                      {event.action}
                      <small>
                        {event.message ?? "Receipt recorded"}
                        {event.tx_hash && event.scan_url ? (
                          <>
                            {" "}
                            <a href={event.scan_url} target="_blank" rel="noreferrer">
                              {shortHash(event.tx_hash)}
                            </a>
                          </>
                        ) : null}
                      </small>
                    </p>
                  </div>
                ))
              : terminalEvents.map((event) => (
                  <div className="terminal-row" key={`${event.stage}-${event.action}`}>
                    <span>{event.stamp}</span>
                    <strong>{event.stage}</strong>
                    <em>{event.status}</em>
                    <p>
                      {event.action}
                      <small>{event.detail}</small>
                    </p>
                  </div>
                ))}
          </div>
          <p className="terminal-status">{supabaseStatus}</p>
        </div>
      </section>

      <section
        className="content-band dashboard-extension-section"
        aria-label="Longcat extension meter"
        style={{ "--dashboard-extension": pageExtension } as CSSProperties}
      >
        <div>
          <p className="eyebrow">Longcat length</p>
          <h2>The page gets longer as the receipts stack.</h2>
        </div>
        <p>
          Burns, profit events, bridges, and SOL long increases extend the dashboard. Live receipts will make this section grow with the cat.
        </p>
        <div className="extension-track">
          <span style={{ width: `${Math.max(8, pageExtension * 100)}%` }} />
        </div>
      </section>

      <section className="content-band burns-section">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Burn telemetry</p>
            <h2>When the long wins, Longcat gets scarcer.</h2>
          </div>
          <p>Burns only update when qualifying realized profit exists and buyback/burn receipts are connected.</p>
        </div>
        <MetricGrid metrics={burnStats} className="burn-metric-grid" />
      </section>

      <section className="content-band how-section">
        <div className="section-heading">
          <span className="icon-chip">
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">How it works</p>
            <h2>From fee to SOL long.</h2>
          </div>
        </div>

        <div className="how-grid">
          {howItWorks.map((step, index) => (
            <article className="how-card" key={step.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
