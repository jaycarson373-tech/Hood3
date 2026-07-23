"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  ExternalLink,
  ListChecks,
  ShieldCheck,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { EXTERNAL_LINKS } from "../constants";
import { automationSteps, howItWorks } from "../data";
import type { Metric } from "../data";
import { LongcatScrollBackdrop, MetricGrid } from "../components/LongcatVisuals";

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

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function terminalTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAssetAmount(value: number, asset: string | null) {
  const symbol = asset?.toUpperCase() ?? "";

  if (symbol === "USDC" || symbol === "USD") {
    return money(value, 2);
  }

  if (symbol === "SOL") {
    return `${value.toFixed(4)} SOL`;
  }

  if (symbol === "LONGCAT" || symbol === "$LONGCAT") {
    return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)} $LONGCAT`;
  }

  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(value);
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function DashboardClient() {
  const [terminalRows, setTerminalRows] = useState<SupabaseTerminalRow[]>([]);
  const [latestPosition, setLatestPosition] = useState<SupabasePositionRow | null>(null);

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
          fetch(`${supabaseUrl}/rest/v1/longcat_public_terminal?select=*&order=created_at.desc&limit=24`, {
            cache: "no-store",
            headers,
          }),
          fetch(`${supabaseUrl}/rest/v1/longcat_latest_position?select=*&market=eq.SOL&limit=1`, {
            cache: "no-store",
            headers,
          }),
        ]);

        if (!terminalResponse.ok || !positionResponse.ok) {
          return;
        }

        const nextTerminalRows = (await terminalResponse.json()) as SupabaseTerminalRow[];
        const nextPositionRows = (await positionResponse.json()) as SupabasePositionRow[];

        if (!active) return;

        setTerminalRows(nextTerminalRows);
        setLatestPosition(nextPositionRows[0] ?? null);
      } catch {
        // Keep the last verified public state during a transient network failure.
      }
    }

    void readSupabaseViews();
    const timer = window.setInterval(readSupabaseViews, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const positionNotional = Math.abs(safeNumber(latestPosition?.notional_usdc));
  const hasPosition = Boolean(latestPosition && positionNotional > 0);
  const positionPnl = safeNumber(latestPosition?.unrealized_pnl_usdc);
  const extensionEvents = terminalRows.filter((row) =>
    ["BURN", "LONG", "BRIDGE", "PROFIT", "BUYBACK"].includes(row.stage.toUpperCase()),
  ).length;
  const pageExtension = Math.min(1, (terminalRows.length + extensionEvents * 2) / 48);

  const dashboardStats = useMemo(() => {
    const metrics: Metric[] = [];
    const totalSolBridged = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BRIDGE" && row.asset?.toUpperCase() === "SOL")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const totalFeesClaimed = terminalRows
      .filter((row) => row.stage.toUpperCase() === "CLAIM" && row.asset?.toUpperCase() === "SOL")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const profitRows = terminalRows.filter((row) => row.stage.toUpperCase() === "PROFIT" && safeNumber(row.amount) > 0);
    const realizedProfit = profitRows.reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const buybackCount = terminalRows.filter((row) => row.stage.toUpperCase() === "BUYBACK").length;
    const burnRows = terminalRows.filter((row) => row.stage.toUpperCase() === "BURN" && safeNumber(row.amount) > 0);
    const tokensBurned = burnRows.reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const lastFeeClaim = terminalRows.find((row) => row.stage.toUpperCase() === "CLAIM");

    if (hasPosition && latestPosition) {
      metrics.push({ label: "POSITION SIZE", value: money(positionNotional, 2), detail: "public SOL long" });

      if (safeNumber(latestPosition.entry_price) > 0) {
        metrics.push({
          label: "ENTRY PRICE",
          value: money(safeNumber(latestPosition.entry_price), 2),
          detail: "verified position data",
        });
      }

      if (safeNumber(latestPosition.mark_price) > 0) {
        metrics.push({
          label: "CURRENT PRICE",
          value: money(safeNumber(latestPosition.mark_price), 2),
          detail: "latest published mark",
        });
      }

      if (safeNumber(latestPosition.leverage) > 0) {
        metrics.push({
          label: "LEVERAGE",
          value: `${safeNumber(latestPosition.leverage).toFixed(2)}x`,
          detail: "published risk data",
        });
      }

      metrics.push(
        { label: "UNREALIZED PNL", value: signedMoney(positionPnl), detail: "published position data" },
        {
          label: "LAST POSITION UPDATE",
          value: terminalTime(latestPosition.recorded_at),
          detail: "latest published receipt",
        },
      );
    }

    if (totalSolBridged > 0) {
      metrics.push({ label: "TOTAL SOL BRIDGED", value: `${totalSolBridged.toFixed(4)} SOL`, detail: "published bridge receipts" });
    }

    if (totalFeesClaimed > 0) {
      metrics.push({ label: "TOTAL FEES DEPLOYED", value: `${totalFeesClaimed.toFixed(4)} SOL`, detail: "published claim receipts" });
    }

    if (realizedProfit > 0) {
      metrics.push({
        label: "REALIZED PROFIT",
        value: formatAssetAmount(realizedProfit, profitRows[0]?.asset ?? null),
        detail: "published profit receipts",
      });
    }

    if (buybackCount > 0) {
      metrics.push({ label: "TOTAL BUYBACKS", value: String(buybackCount), detail: "published transactions" });
    }

    if (tokensBurned > 0) {
      metrics.push({
        label: "TOTAL TOKENS BURNED",
        value: formatAssetAmount(tokensBurned, burnRows[0]?.asset ?? "LONGCAT"),
        detail: "published burn receipts",
      });
    }

    if (lastFeeClaim) {
      metrics.push({ label: "LAST FEE CLAIM", value: terminalTime(lastFeeClaim.created_at), detail: "latest published claim" });
    }

    return metrics;
  }, [hasPosition, latestPosition, positionNotional, positionPnl, terminalRows]);

  const burnMetrics = dashboardStats.filter((metric) =>
    ["REALIZED PROFIT", "TOTAL BUYBACKS", "TOTAL TOKENS BURNED"].includes(metric.label),
  );

  return (
    <>
      <LongcatScrollBackdrop variant="dashboard" extension={pageExtension} />
      <section className="page-hero compact-page-hero">
        <p className="eyebrow">Longcat terminal</p>
        <h1>One position. Extending in public.</h1>
        <p>Verified claims, SOL bridges, position changes, buybacks, and burns are published here.</p>
        {EXTERNAL_LINKS.hyperliquidPosition ? (
          <a className="button ghost" href={EXTERNAL_LINKS.hyperliquidPosition} target="_blank" rel="noreferrer">
            Verify position
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        ) : null}
      </section>

      {dashboardStats.length ? (
        <section className="content-band live-long-section">
          <div className="section-split-heading">
            <div>
              <p className="eyebrow">Live long</p>
              <h2>SOL position telemetry.</h2>
            </div>
            <p>Only verified public position and receipt data is displayed.</p>
          </div>
          <MetricGrid metrics={dashboardStats} className="terminal-metric-grid" />
        </section>
      ) : null}

      {hasPosition && latestPosition ? (
        <section className="dashboard-grid content-band">
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
              <span>Verified SOL long</span>
              <strong>{money(positionNotional)}</strong>
              <small>{signedMoney(positionPnl)} unrealized PnL</small>
            </div>

            <div className="positions-table">
              <div className="table-head">
                <span>Coin</span>
                <span>Size</span>
                <span>Notional</span>
                <span>PnL</span>
              </div>
              <div className="table-row">
                <span>{latestPosition.market}</span>
                <span>{new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(safeNumber(latestPosition.size))}</span>
                <span>{money(positionNotional)}</span>
                <span className={positionPnl >= 0 ? "positive" : "negative"}>{signedMoney(positionPnl)}</span>
              </div>
            </div>

            <div className="disclosure">
              <ShieldCheck size={18} aria-hidden="true" />
              Verified public data only. Execution remains server-side.
            </div>
          </div>
        </section>
      ) : null}

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
          The worker is structured to claim fees, keep the SOL buffer, route collateral to Hyperliquid, scale the SOL long,
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

        {terminalRows.length ? (
          <div className="terminal-panel">
            <div className="terminal-head">
              <div>
                <p className="kicker">Longcat terminal</p>
                <h2>Transaction feed.</h2>
              </div>
              <Terminal size={20} aria-hidden="true" />
            </div>
            <div className="terminal-log" aria-label="Longcat transaction terminal">
              {terminalRows.map((event) => {
                const receiptUrl = safeExternalUrl(event.scan_url);

                return (
                  <div className="terminal-row" key={event.id}>
                    <span>{terminalTime(event.created_at)}</span>
                    <strong>{event.stage}</strong>
                    <em>{event.status.toUpperCase()}</em>
                    <p>
                      {event.action}
                      <small>
                        {event.message ?? "Receipt recorded"}
                        {event.tx_hash && receiptUrl ? (
                          <>
                            {" "}
                            <a href={receiptUrl} target="_blank" rel="noreferrer">
                              {shortHash(event.tx_hash)}
                            </a>
                          </>
                        ) : null}
                      </small>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {terminalRows.length ? (
        <section
          className="content-band dashboard-extension-section"
          aria-label="Longcat extension meter"
          style={{ "--dashboard-extension": pageExtension } as CSSProperties}
        >
          <div>
            <p className="eyebrow">Longcat length</p>
            <h2>The page gets longer as the receipts stack.</h2>
          </div>
          <p>Burns, profit events, bridges, and SOL long increases extend the dashboard.</p>
          <div className="extension-track" aria-hidden="true">
            <span style={{ width: `${Math.max(8, pageExtension * 100)}%` }} />
          </div>
        </section>
      ) : null}

      {burnMetrics.length ? (
        <section className="content-band burns-section">
          <div className="section-split-heading">
            <div>
              <p className="eyebrow">Burn telemetry</p>
              <h2>When the long wins, Longcat gets scarcer.</h2>
            </div>
            <p>Only qualifying realized profit and published buyback or burn receipts are counted.</p>
          </div>
          <MetricGrid metrics={burnMetrics} className="burn-metric-grid" />
        </section>
      ) : null}

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
