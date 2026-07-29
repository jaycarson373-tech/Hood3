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
  DEXSCREENER_URL,
  HYPERLIQUID_TRADE_URL,
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

type ShortPosition = {
  recorded_at: string;
  market: string;
  dex: string;
  side: "short";
  size: number;
  notional_usd: number;
  entry_price: number | null;
  mark_price: number | null;
  leverage: number | null;
  unrealized_pnl_usd: number;
  margin_used_usd: number;
  liquidation_price: number | null;
};

type ShortBookResponse = {
  configured: boolean;
  account: string | null;
  account_url: string | null;
  positions: ShortPosition[];
  summary: {
    short_count: number;
    total_short_notional_usd: number;
    total_margin_used_usd: number;
    total_unrealized_pnl_usd: number;
    account_value_usd: number;
  } | null;
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
  return normalized === "HEDGE" ? "$HEDGE" : normalized;
}

function marketLabel(market: string) {
  return market.includes(":") ? market.split(":").at(-1) ?? market : market;
}

function eventLabel(stage: string) {
  const normalized = stage.toUpperCase();
  const labels: Record<string, string> = {
    CLAIM: "Creator fees claimed",
    ROUTE: "Short-book capital routed",
    BRIDGE: "Bridge confirmed",
    DEPOSIT: "Hyperliquid account funded",
    OPEN: "Short order recorded",
    POSITION: "Short book updated",
    PROFIT: "Realized short profit recorded",
    BUYBACK: "$HEDGE buyback completed",
    BURN: "$HEDGE burn completed",
  };

  return labels[normalized] ?? "Short-book receipt recorded";
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
  const [shortBook, setShortBook] = useState<ShortBookResponse>({
    configured: false,
    account: null,
    account_url: null,
    positions: [],
    summary: null,
  });

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
                `${supabaseUrl}/rest/v1/hedge_public_terminal?select=*&order=created_at.desc&limit=40`,
                { cache: "no-store", headers },
              )
            : Promise.resolve(null),
          fetch("/api/hyperliquid-positions", { cache: "no-store" }),
        ]);

        if (!active) return;
        if (terminalResponse?.ok) {
          setTerminalRows((await terminalResponse.json()) as TerminalRow[]);
        }
        if (positionResponse.ok) {
          setShortBook((await positionResponse.json()) as ShortBookResponse);
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
    const summary = shortBook.summary;
    const shortNotional = safeNumber(summary?.total_short_notional_usd);
    const marginUsed = safeNumber(summary?.total_margin_used_usd);
    const unrealizedPnl = safeNumber(summary?.total_unrealized_pnl_usd);
    const accountValue = safeNumber(summary?.account_value_usd);
    const shortCount = safeNumber(summary?.short_count);
    const successfulRows = terminalRows.filter(
      (row) => row.status.toLowerCase() === "succeeded",
    );
    const claimed = successfulRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "CLAIM" &&
          row.asset?.toUpperCase() === "SOL",
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const bridged = successfulRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "BRIDGE" &&
          row.asset?.toUpperCase() === "SOL",
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
    const weightedLeverage =
      shortNotional > 0
        ? shortBook.positions.reduce(
            (sum, position) =>
              sum +
              safeNumber(position.notional_usd) *
                safeNumber(position.leverage),
            0,
          ) / shortNotional
        : 0;
    const grossExposure =
      accountValue > 0 ? (shortNotional / accountValue) * 100 : 0;
    const hasShorts = shortNotional > 0;
    const lastPositionUpdate = shortBook.positions
      .map((position) => position.recorded_at)
      .sort()
      .at(-1);
    const lastUpdate = lastPositionUpdate ?? terminalRows[0]?.created_at;

    const metrics: DashboardMetric[] = [
      {
        label: "CURRENT SHORT BOOK",
        value: hasShorts ? money(shortNotional) : "—",
        detail: hasShorts ? "published gross notional" : "Verified data required",
      },
      {
        label: "OPEN SHORTS",
        value: shortCount > 0 ? String(shortCount) : "—",
        detail: shortCount > 0 ? "published equity perps" : "Verified data required",
      },
      {
        label: "ACCOUNT VALUE",
        value: accountValue > 0 ? money(accountValue) : "—",
        detail: accountValue > 0 ? "Hyperliquid account value" : "Verified data required",
      },
      {
        label: "UNREALIZED SHORT PNL",
        value: hasShorts ? signedMoney(unrealizedPnl) : "—",
        detail: hasShorts ? "live short-book estimate" : "Verified data required",
        tone:
          hasShorts && unrealizedPnl !== 0
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
        label: "GROSS SHORT EXPOSURE",
        value: grossExposure > 0 ? `${grossExposure.toFixed(1)}%` : "—",
        detail: grossExposure > 0 ? "short notional / account value" : "Verified data required",
      },
      {
        label: "AVERAGE LEVERAGE",
        value: weightedLeverage > 0 ? `${weightedLeverage.toFixed(1)}x` : "—",
        detail: weightedLeverage > 0 ? "notional-weighted leverage" : "Verified data required",
      },
      {
        label: "FUNDING RATE",
        value: "—",
        detail: "Displayed when verified rate data exists",
      },
      {
        label: "MARGIN USED",
        value: marginUsed > 0 ? money(marginUsed) : "—",
        detail: marginUsed > 0 ? "published short-book margin" : "Verified data required",
      },
      {
        label: "LAST UPDATE",
        value: lastUpdate ? terminalTime(lastUpdate) : "—",
        detail: lastUpdate ? "latest verified update" : "Verified data required",
      },
      {
        label: "CURRENT VENUE",
        value: "HYPERLIQUID",
        detail: "public perpetual markets",
      },
    ];

    return { hasShorts, metrics };
  }, [shortBook, terminalRows]);

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">HEDGE CAPITAL / SHORT DESK</p>
          <h1>THE SHORT BOOK, MARKED TO MARKET.</h1>
          <p>
            The mandate shorts selected AI and technology blue chips on
            Hyperliquid. Every position, creator-fee claim, buyback, and burn is
            published when verified data exists.
          </p>
          <div className="button-row">
            <a
              className="button button-dark"
              href={shortBook.account_url || HYPERLIQUID_TRADE_URL}
              target="_blank"
              rel="noreferrer"
            >
              {shortBook.account_url
                ? "View Hyperliquid Account"
                : "Open Hyperliquid"}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            {DEXSCREENER_URL ? (
              <a
                className="button button-light"
                href={DEXSCREENER_URL}
                target="_blank"
                rel="noreferrer"
              >
                $HEDGE Chart
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="dashboard-seal">
          <ShieldCheck size={28} aria-hidden="true" />
          <span>PUBLIC SHORT MANDATE</span>
          <strong>
            {data.hasShorts
              ? "SHORT BOOK PUBLISHED"
              : shortBook.configured
                ? "ACCOUNT CONNECTED · FLAT"
                : "ARMED · AWAITING ACCOUNT"}
          </strong>
        </div>
      </section>

      <section className="dashboard-ledger">
        <div className="dashboard-section-head">
          <div>
            <p className="eyebrow">LIVE DASHBOARD</p>
            <h2>SHORT-BOOK TELEMETRY</h2>
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

      {shortBook.positions.length ? (
        <section className="short-book-section section-shell">
          <div className="dashboard-section-head">
            <div>
              <p className="eyebrow">OPEN POSITIONS</p>
              <h2>THE AI SHORT BOOK</h2>
            </div>
            <span>{shortBook.positions.length} VERIFIED SHORTS</span>
          </div>
          <div className="short-book-table">
            <div className="short-book-head">
              <span>MARKET</span>
              <span>NOTIONAL</span>
              <span>ENTRY</span>
              <span>MARK</span>
              <span>LEVERAGE</span>
              <span>PNL</span>
              <span>LIQUIDATION</span>
            </div>
            {shortBook.positions.map((position) => (
              <div
                className="short-book-row"
                key={`${position.dex}-${position.market}`}
              >
                <strong>
                  {marketLabel(position.market)}
                  <small>{position.dex.toUpperCase()}</small>
                </strong>
                <span>{money(safeNumber(position.notional_usd))}</span>
                <span>
                  {safeNumber(position.entry_price) > 0
                    ? money(safeNumber(position.entry_price), 4)
                    : "—"}
                </span>
                <span>
                  {safeNumber(position.mark_price) > 0
                    ? money(safeNumber(position.mark_price), 4)
                    : "—"}
                </span>
                <span>
                  {safeNumber(position.leverage) > 0
                    ? `${safeNumber(position.leverage).toFixed(1)}x`
                    : "—"}
                </span>
                <span
                  className={
                    safeNumber(position.unrealized_pnl_usd) >= 0
                      ? "positive"
                      : "negative"
                  }
                >
                  {signedMoney(safeNumber(position.unrealized_pnl_usd))}
                </span>
                <span>
                  {safeNumber(position.liquidation_price) > 0
                    ? money(safeNumber(position.liquidation_price), 4)
                    : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="execution-section section-shell">
        <div className="section-intro">
          <p className="eyebrow">THE MANDATE</p>
          <h2>FEES BECOME SHORT EXPOSURE.</h2>
          <p>
            Deployable creator fees route toward a public Hyperliquid account.
            The mandate builds selected AI and technology equity shorts within
            explicit leverage, concentration, and liquidation limits.
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
            <h3>THE SHORT DESK IS ARMED.</h3>
            <p>
              The first verified fee claim, Hyperliquid short, buyback, or burn
              will be published here.
            </p>
          </div>
        )}

        <a
          className="position-proof-link"
          href={shortBook.account_url || POSITION_URL}
          target="_blank"
          rel="noreferrer"
        >
          View public Hyperliquid account
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </section>
    </>
  );
}
