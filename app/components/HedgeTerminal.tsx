"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TerminalRow = {
  stage: string;
  status: string;
  asset: string | null;
  amount: string | number | null;
};

type ShortPosition = {
  market: string;
  notional_usd: number;
  entry_price: number | null;
  leverage: number | null;
  unrealized_pnl_usd: number;
  margin_used_usd: number;
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
  }).format(value);
}

function marketLabel(market: string) {
  return market.includes(":") ? market.split(":").at(-1) ?? market : market;
}

export function HedgeTerminal() {
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
                `${supabaseUrl}/rest/v1/hedge_public_terminal?select=stage,status,asset,amount&status=eq.succeeded&order=created_at.desc&limit=1000`,
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
        // Preserve the last verified public state during transient failures.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const metrics = useMemo(() => {
    const summary = shortBook.summary;
    const notional = safeNumber(summary?.total_short_notional_usd);
    const margin = safeNumber(summary?.total_margin_used_usd);
    const pnl = safeNumber(summary?.total_unrealized_pnl_usd);
    const accountValue = safeNumber(summary?.account_value_usd);
    const shortCount = safeNumber(summary?.short_count);
    const topShort = [...shortBook.positions].sort(
      (a, b) => safeNumber(b.notional_usd) - safeNumber(a.notional_usd),
    )[0];
    const weightedLeverage =
      notional > 0
        ? shortBook.positions.reduce(
            (sum, position) =>
              sum +
              safeNumber(position.notional_usd) *
                safeNumber(position.leverage),
            0,
          ) / notional
        : 0;
    const fees = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "CLAIM" &&
          row.asset?.toUpperCase() === "SOL",
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const bridged = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "BRIDGE" &&
          row.status.toLowerCase() === "succeeded" &&
          row.asset?.toUpperCase() === "SOL",
      )
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const burned = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BURN")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const hasShorts = notional > 0;

    return [
      {
        label: "SYSTEM",
        value: hasShorts
          ? "SHORT BOOK ACTIVE"
          : shortBook.configured
            ? "ACCOUNT CONNECTED · FLAT"
            : "AWAITING ACCOUNT",
      },
      {
        label: "CURRENT SHORT BOOK",
        value: hasShorts ? money(notional) : "—",
      },
      {
        label: "OPEN SHORTS",
        value: shortCount > 0 ? String(shortCount) : "—",
      },
      {
        label: "TOP SHORT",
        value: topShort ? marketLabel(topShort.market) : "—",
      },
      {
        label: "AVERAGE LEVERAGE",
        value: weightedLeverage > 0 ? `${weightedLeverage.toFixed(1)}x` : "—",
      },
      {
        label: "TOP SHORT ENTRY",
        value:
          safeNumber(topShort?.entry_price) > 0
            ? money(safeNumber(topShort?.entry_price), 4)
            : "—",
      },
      {
        label: "UNREALIZED PNL",
        value: hasShorts ? money(pnl) : "—",
      },
      {
        label: "MARGIN USED",
        value: margin > 0 ? money(margin) : "—",
      },
      {
        label: "ACCOUNT VALUE",
        value: accountValue > 0 ? money(accountValue) : "—",
      },
      {
        label: "TOTAL BRIDGED",
        value: bridged > 0 ? `${bridged.toFixed(4)} SOL` : "—",
      },
      {
        label: "FEES COLLECTED",
        value: fees > 0 ? `${fees.toFixed(4)} SOL` : "—",
      },
      {
        label: "$HEDGE BURNED",
        value: burned > 0 ? burned.toLocaleString("en-US") : "—",
      },
    ];
  }, [shortBook, terminalRows]);

  return (
    <aside className="hedge-terminal" aria-label="Live Hyperliquid short book">
      <div className="terminal-titlebar">
        <div>
          <span>HEDGE CAPITAL / HYPERLIQUID</span>
          <strong>AI SHORT MANDATE</strong>
        </div>
        <Radio size={17} aria-hidden="true" />
      </div>
      <div className="terminal-metrics" aria-live="polite">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <div className="terminal-actions">
        <Link className="button button-dark terminal-link" href="/dashboard">
          Open Short Book
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        {shortBook.account_url ? (
          <a
            className="button button-dark terminal-link terminal-account-link"
            href={shortBook.account_url}
            target="_blank"
            rel="noreferrer"
          >
            View Account
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </aside>
  );
}
