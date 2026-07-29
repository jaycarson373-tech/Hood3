"use client";

import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TerminalRow = {
  stage: string;
  status: string;
  asset: string | null;
  amount: string | number | null;
};

type PositionRow = {
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

export function HedgeTerminal() {
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
                `${supabaseUrl}/rest/v1/bbl_public_terminal?select=stage,status,asset,amount&status=eq.succeeded&order=created_at.desc&limit=1000`,
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
    const notional = Math.abs(safeNumber(position?.notional_usdc));
    const margin = Math.abs(safeNumber(position?.margin_used_usdc));
    const entry = safeNumber(position?.entry_price);
    const pnl = safeNumber(position?.unrealized_pnl_usdc);
    const leverage = safeNumber(position?.leverage);
    const fees = terminalRows
      .filter((row) => row.stage.toUpperCase() === "CLAIM")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const burned = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BURN")
      .reduce((sum, row) => sum + safeNumber(row.amount), 0);
    const hasPosition = notional > 0;

    return [
      {
        label: "SYSTEM",
        value: hasPosition ? "HEDGE ACTIVE" : "ARMED · AWAITING RECEIPT",
      },
      {
        label: "CURRENT POSITION",
        value: hasPosition ? money(notional) : "—",
      },
      {
        label: "LONG EXPOSURE",
        value: hasPosition && position?.side === "long" ? money(notional) : "—",
      },
      {
        label: "SHORT EXPOSURE",
        value: hasPosition && position?.side === "short" ? money(notional) : "—",
      },
      {
        label: "LEVERAGE",
        value: leverage > 0 ? `${leverage.toFixed(0)}x` : "—",
      },
      {
        label: "AVERAGE ENTRY",
        value: entry > 0 ? money(entry, 6) : "—",
      },
      {
        label: "UNREALIZED PNL",
        value: hasPosition ? money(pnl) : "—",
      },
      {
        label: "HEDGE VALUE",
        value: margin > 0 ? money(margin) : "—",
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
  }, [position, terminalRows]);

  return (
    <aside className="hedge-terminal" aria-label="Live Hedge treasury terminal">
      <div className="terminal-titlebar">
        <div>
          <span>HEDGE CAPITAL / LIVE</span>
          <strong>PERPETUAL MANDATE</strong>
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
      <Link className="button button-dark terminal-link" href="/dashboard">
        Open Live Dashboard
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
