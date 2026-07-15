"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CircleDollarSign,
  ExternalLink,
  Gauge,
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
  hood3HyperliquidAccount,
  hood3HyperliquidScanUrl,
  howItWorks,
  terminalEvents,
} from "../data";

type LoadState = "idle" | "loading" | "linked" | "error";

type HyperliquidPosition = {
  position?: {
    coin?: string;
    szi?: string;
    positionValue?: string;
    unrealizedPnl?: string;
    entryPx?: string;
    leverage?: {
      type?: string;
      value?: number;
    };
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

function percent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value)}%`;
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
  const [message, setMessage] = useState("Paste a Hyperliquid master or sub-account address to read public perps state.");
  const [account, setAccount] = useState<HyperliquidAccount | null>(null);
  const [monthlyVolume, setMonthlyVolume] = useState(0);
  const [feeBps, setFeeBps] = useState(0);
  const [allocation, setAllocation] = useState(100);
  const [targetLeverage, setTargetLeverage] = useState(0);
  const [hoodMark, setHoodMark] = useState(0);
  const [nltSupply, setNltSupply] = useState(0);
  const [terminalRows, setTerminalRows] = useState<SupabaseTerminalRow[]>([]);
  const [latestPosition, setLatestPosition] = useState<SupabasePositionRow | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState(
    "Receipt feed waiting for live public events.",
  );
  const cleanAddress = address.trim();
  const isValidAddress = addressPattern.test(cleanAddress);
  const scanUrl = isValidAddress ? `https://hypurrscan.io/address/${cleanAddress}` : null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedAddress = window.localStorage.getItem("hood3-hyperliquid-address");

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
          fetch(`${supabaseUrl}/rest/v1/hood3_public_terminal?select=*&order=created_at.desc&limit=12`, {
            headers,
          }),
          fetch(`${supabaseUrl}/rest/v1/hood3_latest_position?select=*&market=eq.HOOD&limit=1`, {
            headers,
          }),
        ]);

        if (!terminalResponse.ok) {
          throw new Error(`Terminal feed returned ${terminalResponse.status}`);
        }

        if (!positionResponse.ok) {
          throw new Error(`Position feed returned ${positionResponse.status}`);
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
  const displayedPositions = hoodPositions.length ? hoodPositions : positions.length ? positions.slice(0, 3) : supabasePositionRows;
  const liveHoodLong = hoodPositions
    .filter((position) => position.size > 0)
    .reduce((sum, position) => sum + position.notional, 0);
  const liveHoodPnl = hoodPositions.reduce((sum, position) => sum + position.pnl, 0);
  const accountValue = safeNumber(account?.marginSummary?.accountValue ?? account?.crossMarginSummary?.accountValue);
  const accountNotional = safeNumber(account?.marginSummary?.totalNtlPos ?? account?.crossMarginSummary?.totalNtlPos);
  const marginUsed = safeNumber(account?.marginSummary?.totalMarginUsed ?? account?.crossMarginSummary?.totalMarginUsed);

  const monthlyFees = monthlyVolume * (feeBps / 10_000);
  const monthlyAllocation = monthlyFees * (allocation / 100);
  const projectedLongNotional = monthlyAllocation * targetLeverage;
  const displayedLongNotional = liveHoodLong > 0 ? liveHoodLong : supabaseHoodLong > 0 ? supabaseHoodLong : projectedLongNotional;
  const displayedPnl = liveHoodLong > 0 ? liveHoodPnl : supabaseHoodPnl;
  const exposureSource = liveHoodLong > 0 ? "Linked HOOD long" : supabaseHoodLong > 0 ? "Supabase HOOD long" : "Projected HOOD long";
  const projectedShares = hoodMark > 0 ? projectedLongNotional / hoodMark : 0;
  const backingPerNlt = displayedLongNotional / Math.max(nltSupply, 1);
  const refillRate = displayedLongNotional > 0 ? (monthlyAllocation / displayedLongNotional) * 100 : 0;
  const burnFlow = monthlyFees - monthlyAllocation;

  async function linkAccount() {
    if (!isValidAddress) {
      setStatus("error");
      setMessage("Enter a 42-character 0x Hyperliquid account address.");
      return;
    }

    setStatus("loading");
    setMessage("Reading public clearinghouse state from Hyperliquid.");

    try {
      const response = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "clearinghouseState",
          user: cleanAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Hyperliquid returned ${response.status}`);
      }

      const data = (await response.json()) as HyperliquidAccount;
      setAccount(data);
      setStatus("linked");
      setMessage("Account linked in read-only mode. HOOD exposure appears when a matching position exists.");
      window.localStorage.setItem("hood3-hyperliquid-address", cleanAddress);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not read the account. Check the address and try again.");
    }
  }

  function clearAccount() {
    setAddress("");
    setAccount(null);
    setStatus("idle");
    setMessage("Paste a Hyperliquid master or sub-account address to read public perps state.");
    window.localStorage.removeItem("hood3-hyperliquid-address");
  }

  return (
    <>
      <section className="page-hero compact-page-hero">
        <p className="eyebrow">Hood3 dashboard</p>
        <h1>NLT Flywheel terminal</h1>
        <p>
          Track the public HOOD long, creator fees deployed, realized profit, HOOD3 buybacks, and permanent burns.
        </p>
      </section>

      <section className="dashboard-grid content-band">
        <div className="panel flywheel-panel">
          <div className="section-heading">
            <span className="icon-chip">
              <RefreshCcw size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Native Leverage Token (NLT) Flywheel</p>
              <h2>Creator-fee flywheel</h2>
            </div>
          </div>

          <div className="flywheel-visual" aria-label="Fee to HOOD long flywheel">
            <div className="flywheel-ring">
              <div className="flywheel-core">
                <span>HOOD long</span>
                <strong>{money(displayedLongNotional)}</strong>
                <small>{liveHoodLong > 0 ? "linked account" : "waiting for flow"}</small>
              </div>
            </div>
            <div className="flywheel-legend">
              <span>Creator Fees</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>HOOD Long</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>Realized Profit</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>HOOD3 Buyback</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>Permanent Burn</span>
            </div>
          </div>

          <div className="flywheel-steps">
            <div>
              <span>Fees deployed</span>
              <strong>{money(monthlyFees)}</strong>
              <small>creator fees</small>
            </div>
            <div>
              <span>HOOD long</span>
              <strong>{money(monthlyAllocation)}</strong>
              <small>{percent(allocation)} deployed</small>
            </div>
            <div>
              <span>Realized profit</span>
              <strong>{money(projectedLongNotional)}</strong>
              <small>{targetLeverage}x model</small>
            </div>
            <div>
              <span>Buyback burn</span>
              <strong>{money(burnFlow)}</strong>
              <small>HOOD3 removed</small>
            </div>
          </div>
        </div>

        <div className="panel controls-panel">
          <div className="section-heading compact-heading">
            <span className="icon-chip">
              <Gauge size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="kicker">Desk controls</p>
              <h2>Flywheel model</h2>
            </div>
          </div>

          <label className="control">
            <span>Monthly creator fee flow</span>
            <input
              type="number"
              min="0"
              step="10000"
              value={monthlyVolume}
              onChange={(event) => setMonthlyVolume(safeNumber(event.target.value, monthlyVolume))}
            />
          </label>

          <label className="range-control">
            <span>
              Protocol fee <strong>{feeBps} bps</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={feeBps}
              onChange={(event) => setFeeBps(safeNumber(event.target.value, feeBps))}
            />
          </label>

          <label className="range-control">
            <span>
              Fees deployed to HOOD long <strong>{percent(allocation)}</strong>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={allocation}
              onChange={(event) => setAllocation(safeNumber(event.target.value, allocation))}
            />
          </label>

          <div className="two-controls">
            <label className="control">
              <span>Target leverage</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.25"
                value={targetLeverage}
                onChange={(event) => setTargetLeverage(safeNumber(event.target.value, targetLeverage))}
              />
            </label>
            <label className="control">
              <span>HOOD mark</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={hoodMark}
                onChange={(event) => setHoodMark(safeNumber(event.target.value, hoodMark))}
              />
            </label>
          </div>

          <label className="control">
            <span>NLT supply</span>
            <input
              type="number"
              min="0"
              step="1000"
              value={nltSupply}
              onChange={(event) => setNltSupply(safeNumber(event.target.value, nltSupply))}
            />
          </label>

          <div className="risk-strip">
            <div>
              <span>Projected shares</span>
              <strong>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(projectedShares)}</strong>
            </div>
            <div>
              <span>NLT Flywheel signal</span>
              <strong>{money(backingPerNlt, 4)}</strong>
            </div>
            <div>
              <span>Deployment rate</span>
              <strong>{percent(refillRate)}</strong>
            </div>
          </div>
        </div>
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
            <span>Hood3 Hyperliquid account</span>
            <strong>{shortAddress(hood3HyperliquidAccount)}</strong>
            <a href={hood3HyperliquidScanUrl} target="_blank" rel="noreferrer">
              View live position on HypurrScan
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
              Read account
            </button>
            {scanUrl ? (
              <a className="button ghost" href={scanUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={17} aria-hidden="true" />
                Open scan
              </a>
            ) : (
              <button className="button ghost" type="button" disabled title="Enter a valid 0x wallet to open HypurrScan">
                <ExternalLink size={17} aria-hidden="true" />
                Open scan
              </button>
            )}
            <button className="icon-button" type="button" onClick={clearAccount} aria-label="Clear linked account">
              <RefreshCcw size={18} aria-hidden="true" />
            </button>
          </div>

          <p className="helper-text">{message}</p>

          <div className="scan-card">
            <span>Hyperliquid scan</span>
            <strong>{isValidAddress ? shortAddress(cleanAddress) : "Waiting for wallet"}</strong>
            {scanUrl ? (
              <a href={scanUrl} target="_blank" rel="noreferrer">
                View account on HypurrScan
                <ExternalLink size={14} aria-hidden="true" />
              </a>
            ) : (
              <small>Paste a valid wallet to unlock the external account view.</small>
            )}
          </div>

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
            <strong>{money(displayedLongNotional)}</strong>
            <small>
              {liveHoodLong > 0 || supabaseHoodLong > 0
                ? `${money(displayedPnl)} unrealized PnL`
                : "Waiting for live account or Supabase position row"}
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
                Live HOOD position rows will appear here when the public account or receipt feed posts a position.
              </div>
            )}
          </div>

          <div className="disclosure">
            <ShieldCheck size={18} aria-hidden="true" />
            No private keys in the browser. Execution belongs in server-side Supabase workers.
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
          The launch flow is simple: creator fees fund the public HOOD long, realized profits market buy HOOD3, and
          bought tokens are permanently burned.
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

      <section className="content-band how-section">
        <div className="section-heading">
          <span className="icon-chip">
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="kicker">How it works</p>
            <h2>From claim to HOOD long.</h2>
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
