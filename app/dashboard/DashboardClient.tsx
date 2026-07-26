"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  ExternalLink,
  ListChecks,
  ShieldCheck,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { ANSEM, EXTERNAL_LINKS } from "../constants";
import { automationSteps, howItWorks } from "../data";
import type { Metric } from "../data";
import {
  BullBackdrop,
  MetricGrid,
} from "../components/BullVisuals";

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

function money(value: number, maximumFractionDigits = 2) {
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

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAssetAmount(value: number, asset: string | null) {
  const symbol = asset?.toUpperCase() ?? "";

  if (symbol === "USDC" || symbol === "USD") return money(value, 2);
  if (symbol === "SOL") return `${value.toFixed(4)} SOL`;
  if (symbol === "ANSEM" || symbol === "UANSEM") {
    return `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value)} ANSEM`;
  }
  if (symbol === "BBL" || symbol === "$BBL") {
    return `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value)} $BBL`;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(value);
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
  const [latestPosition, setLatestPosition] =
    useState<SupabasePositionRow | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    let active = true;

    async function readSupabaseViews() {
      try {
        const headers = {
          apikey: supabaseAnonKey ?? "",
          Authorization: `Bearer ${supabaseAnonKey}`,
        };
        const [terminalResponse, positionResponse] = await Promise.all([
          fetch(
            `${supabaseUrl}/rest/v1/bbl_public_terminal?select=*&order=created_at.desc&limit=30`,
            { cache: "no-store", headers },
          ),
          fetch(
            `${supabaseUrl}/rest/v1/bbl_latest_position?select=*&market=eq.ANSEM&limit=1`,
            { cache: "no-store", headers },
          ),
        ]);

        if (!terminalResponse.ok || !positionResponse.ok) return;

        const nextTerminalRows =
          (await terminalResponse.json()) as SupabaseTerminalRow[];
        const nextPositionRows =
          (await positionResponse.json()) as SupabasePositionRow[];

        if (!active) return;
        setTerminalRows(nextTerminalRows);
        setLatestPosition(nextPositionRows[0] ?? null);
      } catch {
        // Keep the last verified public state during a transient failure.
      }
    }

    void readSupabaseViews();
    const timer = window.setInterval(readSupabaseViews, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const positionNotional = Math.abs(
    safeNumber(latestPosition?.notional_usdc),
  );
  const positionSize = Math.abs(safeNumber(latestPosition?.size));
  const hasPosition = Boolean(
    latestPosition && (positionNotional > 0 || positionSize > 0),
  );
  const positionPnl = safeNumber(latestPosition?.unrealized_pnl_usdc);

  const dashboardStats = useMemo(() => {
    const metrics: Metric[] = [];
    const totalSolRouted = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "BRIDGE" &&
          row.asset?.toUpperCase() === "SOL",
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const totalFeesClaimed = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "CLAIM" &&
          row.asset?.toUpperCase() === "SOL",
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const profitRows = terminalRows.filter(
      (row) =>
        row.stage.toUpperCase() === "PROFIT" &&
        safeNumber(row.amount) > 0,
    );
    const realizedProfit = profitRows.reduce(
      (sum, row) => sum + safeNumber(row.amount),
      0,
    );
    const buybackCount = terminalRows.filter(
      (row) => row.stage.toUpperCase() === "BUYBACK",
    ).length;
    const burnRows = terminalRows.filter(
      (row) =>
        row.stage.toUpperCase() === "BURN" &&
        safeNumber(row.amount) > 0,
    );
    const tokensBurned = burnRows.reduce(
      (sum, row) => sum + safeNumber(row.amount),
      0,
    );
    const lastUpdate =
      latestPosition?.recorded_at || terminalRows[0]?.created_at || null;

    if (hasPosition && latestPosition) {
      if (positionSize > 0) {
        metrics.push({
          label: "ANSEM POSITION",
          value: formatAssetAmount(positionSize, "ANSEM"),
          detail: "public spot balance",
        });
      }
      if (positionNotional > 0) {
        metrics.push({
          label: "POSITION VALUE",
          value: money(positionNotional),
          detail: "latest published value",
        });
      }
      if (safeNumber(latestPosition.entry_price) > 0) {
        metrics.push({
          label: "AVERAGE ENTRY",
          value: money(safeNumber(latestPosition.entry_price), 6),
          detail: "published cost basis",
        });
      }
      if (safeNumber(latestPosition.mark_price) > 0) {
        metrics.push({
          label: "ANSEM PRICE",
          value: money(safeNumber(latestPosition.mark_price), 6),
          detail: "latest published mark",
        });
      }
      if (safeNumber(latestPosition.entry_price) > 0) {
        metrics.push({
          label: "UNREALIZED PNL",
          value: signedMoney(positionPnl),
          detail: "published position estimate",
        });
      }
    }

    if (totalSolRouted > 0) {
      metrics.push({
        label: "TOTAL SOL ROUTED",
        value: `${totalSolRouted.toFixed(4)} SOL`,
        detail: "published transfer receipts",
      });
    }
    if (totalFeesClaimed > 0) {
      metrics.push({
        label: "TOTAL FEES DEPLOYED",
        value: `${totalFeesClaimed.toFixed(4)} SOL`,
        detail: "published claim receipts",
      });
    }
    if (realizedProfit > 0) {
      metrics.push({
        label: "REALIZED PROFIT",
        value: formatAssetAmount(
          realizedProfit,
          profitRows[0]?.asset ?? null,
        ),
        detail: "published profit receipts",
      });
    }
    if (buybackCount > 0) {
      metrics.push({
        label: "TOTAL BUYBACKS",
        value: String(buybackCount),
        detail: "published transactions",
      });
    }
    if (tokensBurned > 0) {
      metrics.push({
        label: "TOTAL $BBL BURNED",
        value: formatAssetAmount(
          tokensBurned,
          burnRows[0]?.asset ?? "BBL",
        ),
        detail: "published burn receipts",
      });
    }
    if (lastUpdate) {
      metrics.push({
        label: "LAST PUBLIC UPDATE",
        value: terminalTime(lastUpdate),
        detail: "latest receipt timestamp",
      });
    }

    return metrics;
  }, [
    hasPosition,
    latestPosition,
    positionNotional,
    positionPnl,
    positionSize,
    terminalRows,
  ]);

  return (
    <>
      <BullBackdrop variant="dashboard" />

      <section className="page-hero dashboard-hero">
        <p className="eyebrow">BLACK BULL TERMINAL</p>
        <h1>ONE POSITION. BUILT IN PUBLIC.</h1>
        <p>
          Creator-fee claims, Unit routes, ANSEM spot orders, realized profit,
          $BBL buybacks, and burns appear only after a public receipt exists.
        </p>
        <div className="button-row">
          {EXTERNAL_LINKS.position ? (
            <a
              className="button primary"
              href={EXTERNAL_LINKS.position}
              target="_blank"
              rel="noreferrer"
            >
              Verify Account
              <ExternalLink size={17} aria-hidden="true" />
            </a>
          ) : null}
          <a
            className="button ghost"
            href={ANSEM.hyperliquidSpotUrl}
            target="_blank"
            rel="noreferrer"
          >
            ANSEM Spot
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      {dashboardStats.length ? (
        <section className="dashboard-metrics section-band">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">VERIFIED TELEMETRY</p>
              <h2>THE BULL, BY THE NUMBERS.</h2>
            </div>
            <p>Verified receipts only. No invented position.</p>
          </div>
          <MetricGrid metrics={dashboardStats} />
        </section>
      ) : (
        <section className="dashboard-empty section-band">
          <span aria-hidden="true">00</span>
          <div>
            <p className="eyebrow">PUBLIC POSITION</p>
            <h2>NO POSITION PUBLISHED.</h2>
            <p>
              The dashboard remains blank until the execution account publishes
              a verified ANSEM position or transaction receipt.
            </p>
          </div>
        </section>
      )}

      {hasPosition && latestPosition ? (
        <section className="position-section section-band">
          <div className="section-heading">
            <span className="icon-chip">
              <TrendingUp size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">PUBLISHED EXPOSURE</p>
              <h2>CURRENT ANSEM SPOT.</h2>
            </div>
          </div>
          <div className="position-readout">
            <div>
              <span>ANSEM HELD</span>
              <strong>{formatAssetAmount(positionSize, "ANSEM")}</strong>
            </div>
            <div>
              <span>POSITION VALUE</span>
              <strong>{money(positionNotional)}</strong>
            </div>
            <div>
              <span>
                {safeNumber(latestPosition.mark_price) > 0
                  ? "MARK PRICE"
                  : "MARKET"}
              </span>
              <strong>
                {safeNumber(latestPosition.mark_price) > 0
                  ? money(safeNumber(latestPosition.mark_price), 6)
                  : "ANSEM / USDC"}
              </strong>
            </div>
          </div>
          <p className="disclosure">
            <ShieldCheck size={18} aria-hidden="true" />
            Spot exposure has no liquidation price, but the asset can still
            lose substantial or total value.
          </p>
        </section>
      ) : null}

      <section className="automation-section section-band">
        <div className="section-heading">
          <span className="icon-chip">
            <ListChecks size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">AUTOMATION RAIL</p>
            <h2>CHECKED EVERY 15 MINUTES.</h2>
          </div>
        </div>
        <p className="section-copy">
          The worker is designed to preserve the SOL fee buffer, route managed
          collateral through Unit, buy ANSEM spot within hard limits, and
          publish every completed stage.
        </p>
        <div className="automation-grid">
          {automationSteps.map((step) => (
            <article key={step.label}>
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
                <p className="eyebrow">PUBLIC RECEIPTS</p>
                <h2>TRANSACTION FEED.</h2>
              </div>
              <Terminal size={20} aria-hidden="true" />
            </div>
            <div className="terminal-log" aria-label="BBL transaction terminal">
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
                            <a
                              href={receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
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

      <section className="how-section section-band">
        <div className="section-heading">
          <span className="icon-chip">
            <CircleDollarSign size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">HOW IT WORKS</p>
            <h2>FROM FEE TO BLACK BULL.</h2>
          </div>
        </div>
        <div className="how-grid">
          {howItWorks.map((step, index) => (
            <article key={step.title}>
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
