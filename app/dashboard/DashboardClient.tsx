"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Radio,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import {
  ASTER_MARKET_URL,
  DEXSCREENER_URL,
  POSITION_URL,
} from "../../lib/links";
import { automationSteps } from "../data";

type TerminalRow = {
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

type PositionRow = {
  recorded_at: string;
  aster_account: string;
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

type PositionResponse = {
  position: PositionRow | null;
};

type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "positive" | "negative";
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

function signedMoney(value: number) {
  const formatted = money(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
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

function shortHash(hash: string) {
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
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

function displayAsset(asset: string | null) {
  const normalized = asset?.toUpperCase();
  if (!normalized) return "";
  if (normalized === "BBL" || normalized === "$BBL") return "$HEDGE";
  return normalized.startsWith("$") ? normalized : normalized;
}

function eventLabel(stage: string) {
  const normalized = stage.toUpperCase();
  const labels: Record<string, string> = {
    CLAIM: "Creator fees claimed",
    ROUTE: "Strategy capital routed",
    BRIDGE: "Bridge confirmed",
    DEPOSIT: "Execution account funded",
    OPEN: "Position order recorded",
    POSITION: "Position updated",
    PROFIT: "Realized profit recorded",
    BUYBACK: "$HEDGE buyback completed",
    BURN: "$HEDGE burn completed",
  };

  return labels[normalized] ?? "Strategy receipt recorded";
}

function amountLabel(row: TerminalRow) {
  const amount = safeNumber(row.amount);
  if (!(amount > 0)) return null;
  const asset = displayAsset(row.asset);

  if (asset === "USD" || asset === "USDC" || asset === "USDT") {
    return money(amount);
  }
  if (asset === "SOL") return `${amount.toFixed(4)} SOL`;
  if (asset === "$HEDGE") {
    return `${new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(amount)} $HEDGE`;
  }

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(amount)}${asset ? ` ${asset}` : ""}`;
}

export function DashboardClient() {
  const [terminalRows, setTerminalRows] = useState<TerminalRow[]>([]);
  const [position, setPosition] = useState<PositionRow | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const headers = {
          apikey: supabaseAnonKey ?? "",
          Authorization: `Bearer ${supabaseAnonKey}`,
        };
        const [terminalResponse, positionResponse] = await Promise.all([
          supabaseUrl && supabaseAnonKey
            ? fetch(
                `${supabaseUrl}/rest/v1/bbl_public_terminal?select=*&order=created_at.desc&limit=40`,
                { cache: "no-store", headers },
              )
            : Promise.resolve(null),
          fetch("/api/aster-position", { cache: "no-store" }),
        ]);

        if (!active) return;
        if (terminalResponse?.ok) {
          setTerminalRows((await terminalResponse.json()) as TerminalRow[]);
        }
        if (positionResponse.ok) {
          const payload = (await positionResponse.json()) as PositionResponse;
          setPosition(payload.position);
        }
      } catch {
        // Keep the last verified public state during transient provider failures.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const data = useMemo(() => {
    const positionValue = Math.abs(safeNumber(position?.notional_usdc));
    const collateral = Math.abs(safeNumber(position?.margin_used_usdc));
    const unrealizedPnl = safeNumber(position?.unrealized_pnl_usdc);
    const leverage = safeNumber(position?.leverage);
    const entryPrice = safeNumber(position?.entry_price);
    const markPrice = safeNumber(position?.mark_price);
    const successfulRows = terminalRows.filter(
      (row) => row.status.toLowerCase() === "succeeded",
    );
    const claimed = successfulRows
      .filter((row) => row.stage.toUpperCase() === "CLAIM")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const bridged = successfulRows
      .filter((row) =>
        ["BRIDGE", "ROUTE", "DEPOSIT"].includes(row.stage.toUpperCase()),
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const realized = successfulRows
      .filter((row) => row.stage.toUpperCase() === "PROFIT")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const buybacks = successfulRows.filter(
      (row) => row.stage.toUpperCase() === "BUYBACK",
    );
    const burned = successfulRows
      .filter((row) => row.stage.toUpperCase() === "BURN")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const currentBuyback = buybacks[0] ? safeNumber(buybacks[0].amount) : 0;
    const treasuryRoi = collateral > 0 ? (unrealizedPnl / collateral) * 100 : 0;
    const hasPosition = positionValue > 0;
    const lastUpdate = position?.recorded_at ?? terminalRows[0]?.created_at;

    const metrics: DashboardMetric[] = [
      {
        label: "CURRENT POSITION",
        value: hasPosition ? money(positionValue) : "—",
        detail: hasPosition ? "published notional" : "Verified data required",
      },
      {
        label: "STRATEGY COLLATERAL",
        value: collateral > 0 ? money(collateral) : "—",
        detail: collateral > 0 ? "margin in use" : "Verified data required",
      },
      {
        label: "UNREALIZED PNL",
        value: hasPosition ? signedMoney(unrealizedPnl) : "—",
        detail: hasPosition ? "live position estimate" : "Verified data required",
        tone:
          hasPosition && unrealizedPnl !== 0
            ? unrealizedPnl > 0
              ? "positive"
              : "negative"
            : undefined,
      },
      {
        label: "REALIZED PROFIT",
        value: realized > 0 ? money(realized) : "—",
        detail: realized > 0 ? "published profit receipts" : "Verified data required",
      },
      {
        label: "TOTAL BRIDGED",
        value: bridged > 0 ? `${bridged.toFixed(4)} SOL` : "—",
        detail: bridged > 0 ? "published route receipts" : "Verified data required",
      },
      {
        label: "BRIDGE QUEUE",
        value: "—",
        detail: "Displayed when a public queue exists",
      },
      {
        label: "$HEDGE BURNED",
        value:
          burned > 0
            ? new Intl.NumberFormat("en-US", {
                maximumFractionDigits: 2,
              }).format(burned)
            : "—",
        detail: burned > 0 ? "published burn receipts" : "Verified data required",
      },
      {
        label: "CURRENT BUYBACK",
        value: currentBuyback > 0 ? money(currentBuyback) : "—",
        detail: currentBuyback > 0 ? "latest published receipt" : "Verified data required",
      },
      {
        label: "LIFETIME BUYBACKS",
        value: buybacks.length > 0 ? String(buybacks.length) : "—",
        detail: buybacks.length > 0 ? "published transactions" : "Verified data required",
      },
      {
        label: "LIFETIME FEES",
        value: claimed > 0 ? `${claimed.toFixed(4)} SOL` : "—",
        detail: claimed > 0 ? "published claim receipts" : "Verified data required",
      },
      {
        label: "STRATEGY ROI",
        value: collateral > 0 ? `${treasuryRoi.toFixed(2)}%` : "—",
        detail: collateral > 0 ? "unrealized PnL / collateral" : "Verified data required",
        tone:
          collateral > 0 && treasuryRoi !== 0
            ? treasuryRoi > 0
              ? "positive"
              : "negative"
            : undefined,
      },
      {
        label: "MARKET BIAS",
        value: hasPosition ? position?.side.toUpperCase() ?? "—" : "—",
        detail: hasPosition ? "current published side" : "Verified data required",
      },
      {
        label: "FUNDING RATE",
        value: "—",
        detail: "Displayed when a public rate exists",
      },
      {
        label: "AVERAGE ENTRY",
        value: entryPrice > 0 ? money(entryPrice, 6) : "—",
        detail: entryPrice > 0 ? "published cost basis" : "Verified data required",
      },
      {
        label: "CURRENT MARK",
        value: markPrice > 0 ? money(markPrice, 6) : "—",
        detail: markPrice > 0 ? "latest exchange mark" : "Verified data required",
      },
      {
        label: "LEVERAGE",
        value: leverage > 0 ? `${leverage.toFixed(1)}x` : "—",
        detail: leverage > 0 ? "published account leverage" : "Verified data required",
      },
      {
        label: "LAST UPDATE",
        value: lastUpdate ? terminalTime(lastUpdate) : "—",
        detail: lastUpdate ? "latest verified receipt" : "Verified data required",
      },
      {
        label: "CURRENT EXCHANGE",
        value: "ASTER",
        detail: "execution venue",
      },
    ];

    return { hasPosition, metrics };
  }, [position, terminalRows]);

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">HEDGE CAPITAL / RISK DESK</p>
          <h1>THE FUND, MARKED TO MARKET.</h1>
          <p>
            Every creator-fee claim, position update, buyback, and burn appears
            when its verified receipt exists.
          </p>
          <div className="button-row">
            <a
              className="button button-dark"
              href={ASTER_MARKET_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open Exchange
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            <a
              className="button button-light"
              href={DEXSCREENER_URL}
              target="_blank"
              rel="noreferrer"
            >
              $HEDGE Chart
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="dashboard-seal">
          <ShieldCheck size={28} aria-hidden="true" />
          <span>PUBLIC MANDATE</span>
          <strong>
            {data.hasPosition
              ? "POSITION PUBLISHED"
              : "ARMED · AWAITING FIRST RECEIPT"}
          </strong>
        </div>
      </section>

      <section className="dashboard-ledger">
        <div className="dashboard-section-head">
          <div>
            <p className="eyebrow">LIVE DASHBOARD</p>
            <h2>PORTFOLIO TELEMETRY</h2>
          </div>
          <span>
            <Radio size={15} aria-hidden="true" />
            PUBLIC DATA
          </span>
        </div>
        <div className="dashboard-stat-grid" aria-live="polite">
          {data.metrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong className={metric.tone}>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="execution-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">OPERATIONS</p>
          <h2>THE AUTOMATION RAIL.</h2>
          <p>
            The worker checks creator fees on a fixed cadence, routes managed
            capital, maintains the configured position, and publishes completed
            stages.
          </p>
        </div>
        <div className="execution-steps">
          {automationSteps.map((step) => (
            <article key={step.label}>
              <span>{step.label}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="activity-section section-shell" id="activity">
        <div className="dashboard-section-head">
          <div>
            <p className="eyebrow">LIVE ACTIVITY</p>
            <h2>PUBLIC RECEIPT TAPE</h2>
          </div>
          <ReceiptText size={20} aria-hidden="true" />
        </div>

        {terminalRows.length ? (
          <div className="receipt-table">
            <div className="receipt-table-head">
              <span>TIME</span>
              <span>EVENT</span>
              <span>AMOUNT</span>
              <span>PROOF</span>
            </div>
            {terminalRows.map((event) => {
              const receiptUrl = safeExternalUrl(event.scan_url);
              const amount = amountLabel(event);

              return (
                <div className="receipt-row" key={event.id}>
                  <time dateTime={event.created_at}>
                    {terminalTime(event.created_at)}
                  </time>
                  <span>
                    <CheckCircle2 size={15} aria-hidden="true" />
                    {eventLabel(event.stage)}
                  </span>
                  <strong>{amount ?? "—"}</strong>
                  {event.tx_hash && receiptUrl ? (
                    <a href={receiptUrl} target="_blank" rel="noreferrer">
                      {shortHash(event.tx_hash)}
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="receipt-empty">
            <ReceiptText size={22} aria-hidden="true" />
            <h3>THE DESK IS ARMED.</h3>
            <p>
              The first verified fee claim, position, buyback, or burn will be
              published here.
            </p>
          </div>
        )}

        <a
          className="position-proof-link"
          href={POSITION_URL}
          target="_blank"
          rel="noreferrer"
        >
          View public execution account
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
