"use client";

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
import { MetricGrid } from "../components/LongcatVisuals";

type LoadState = "idle" | "loading" | "linked" | "error";

type LighterPosition = {
  position?: {
    coin?: string;
    szi?: string;
    positionValue?: string;
    unrealizedPnl?: string;
  };
};

type LighterAccount = {
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
  assetPositions?: LighterPosition[];
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
  tx_hash: string | null;
  scan_url: string | null;
};

type SupabasePositionRow = {
  recorded_at: string;
  lighter_account: string;
  market: string;
  side: string;
  size: string | number;
  notional_usdc: string | number;
  leverage: string | number;
  unrealized_pnl_usdc: string | number;
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

function normalizePositions(account: LighterAccount | null): NormalizedPosition[] {
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
  const [message, setMessage] = useState("Awaiting public Lighter account integration. Paste an address to label the dashboard locally.");
  const [account, setAccount] = useState<LighterAccount | null>(null);
  const [terminalRows, setTerminalRows] = useState<SupabaseTerminalRow[]>([]);
  const [latestPosition, setLatestPosition] = useState<SupabasePositionRow | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState("Receipt feed waiting for live public events.");
  const cleanAddress = address.trim();
  const isValidAddress = addressPattern.test(cleanAddress);
  const scanUrl = isValidAddress ? lighterUrl : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedAddress = window.localStorage.getItem("hood3-lighter-address");

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
          fetch(`${supabaseUrl}/rest/v1/longcat_latest_position?select=*&market=eq.HOOD&limit=1`, {
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
  const hoodPositions = positions.filter((position) => position.coin.toUpperCase().includes("HOOD"));
  const supabaseHoodLong =
    latestPosition?.side?.toLowerCase() === "long" ? Math.abs(safeNumber(latestPosition.notional_usdc)) : 0;
  const supabaseHoodPnl = safeNumber(latestPosition?.unrealized_pnl_usdc);
  const supabasePositionRows: NormalizedPosition[] = latestPosition
    ? [
        {
          coin: latestPosition.market,
          size: safeNumber(latestPosition.size),
          notional: Math.abs(safeNumber(latestPosition.notional_usdc)),
          pnl: supabaseHoodPnl,
        },
      ]
    : [];
  const displayedPositions = hoodPositions.length
    ? hoodPositions
    : positions.length
      ? positions.slice(0, 3)
      : supabasePositionRows;
  const liveHoodLong = hoodPositions
    .filter((position) => position.size > 0)
    .reduce((sum, position) => sum + position.notional, 0);
  const liveHoodPnl = hoodPositions.reduce((sum, position) => sum + position.pnl, 0);
  const accountValue = safeNumber(account?.marginSummary?.accountValue ?? account?.crossMarginSummary?.accountValue);
  const accountNotional = safeNumber(account?.marginSummary?.totalNtlPos ?? account?.crossMarginSummary?.totalNtlPos);
  const marginUsed = safeNumber(account?.marginSummary?.totalMarginUsed ?? account?.crossMarginSummary?.totalMarginUsed);

  const displayedLongNotional = liveHoodLong > 0 ? liveHoodLong : supabaseHoodLong > 0 ? supabaseHoodLong : 0;
  const displayedPnl = liveHoodLong > 0 ? liveHoodPnl : supabaseHoodPnl;
  const exposureSource =
    liveHoodLong > 0 ? "Linked HOOD long" : supabaseHoodLong > 0 ? "Supabase HOOD long" : "Awaiting live integration.";

  async function linkAccount() {
    if (!isValidAddress) {
      setStatus("error");
      setMessage("Enter a 42-character 0x Lighter account address.");
      return;
    }

    setAccount(null);
    setStatus("linked");
    setMessage("Lighter account saved locally. Live Lighter account reads will activate after API integration.");
    window.localStorage.setItem("hood3-lighter-address", cleanAddress);
  }

  function clearAccount() {
    setAddress("");
    setAccount(null);
    setStatus("idle");
    setMessage("Awaiting public Lighter account integration. Paste an address to label the dashboard locally.");
    window.localStorage.removeItem("hood3-lighter-address");
  }

  return (
    <>
      <section className="page-hero compact-page-hero">
        <p className="eyebrow">Hood3 terminal</p>
        <h1>One position. Extending in public.</h1>
        <p>Track the public HOOD long on Lighter, 2% creator fees deployed, realized profit, $HOOD3 buybacks, and burns.</p>
      </section>

      <section className="content-band live-long-section">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Live long</p>
            <h2>HOOD position telemetry.</h2>
          </div>
          <p>Structured for real API data later. Until then, every value is explicitly marked as awaiting integration.</p>
        </div>
        <MetricGrid metrics={livePositionStats} className="terminal-metric-grid" />
      </section>

      <section className="dashboard-grid content-band">
        <div className="panel account-panel">
          <div className="section-heading">
            <span className="icon-chip">
              <WalletCards size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Lighter account</p>
              <h2>Read-only link</h2>
            </div>
          </div>

          <div className={`status-pill ${status}`}>
            <span aria-hidden="true" />
            {status === "loading" ? "Reading account" : status === "linked" ? "Account linked" : status === "error" ? "Needs attention" : "Ready to link"}
          </div>

          <div className="scan-card public-account-card">
            <span>Hood3 public Lighter account</span>
            <strong>Awaiting Lighter account.</strong>
            <p>The live Lighter account will be published after the first verified HOOD position.</p>
            <a href={lighterUrl} target="_blank" rel="noreferrer">
              Open Lighter
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
                Open Lighter
              </a>
            ) : (
              <button className="button ghost" type="button" disabled title="Enter a valid 0x wallet to open Lighter">
                <ExternalLink size={17} aria-hidden="true" />
                Open Lighter
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
              <h2>Current HOOD long</h2>
            </div>
          </div>

          <div className="exposure-number">
            <span>{exposureSource}</span>
            <strong>{displayedLongNotional > 0 ? money(displayedLongNotional) : "Awaiting live integration."}</strong>
            <small>
              {liveHoodLong > 0 || supabaseHoodLong > 0
                ? `${money(displayedPnl)} unrealized PnL`
                : "Public Lighter position data will appear after integration."}
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
                Live HOOD position rows will appear here when the public Lighter account or receipt feed posts a position.
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
            <h2>Designed to run end to end.</h2>
          </div>
        </div>

        <p className="section-copy">
          The live route is straightforward: 2% creator fees extend the public HOOD long on Lighter, qualifying realized profits buy
          $HOOD3, and purchased tokens are permanently burned.
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
              <p className="kicker">Hood3 terminal</p>
              <h2>Transaction feed.</h2>
            </div>
            <Terminal size={20} aria-hidden="true" />
          </div>
          <div className="terminal-log" aria-label="Hood3 transaction terminal">
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

      <section className="content-band burns-section">
        <div className="section-split-heading">
          <div>
            <p className="eyebrow">Burn telemetry</p>
            <h2>When the long wins, Hood3 gets scarcer.</h2>
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
            <h2>From fee to HOOD long.</h2>
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
