"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TerminalRow = {
  stage: string;
  status: string;
  asset: string | null;
  amount: string | number | null;
};

type PositionRow = {
  side: string;
  notional_usdc: string | number;
  entry_price: string | number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function tokenAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function HeroTerminal() {
  const [terminalRows, setTerminalRows] = useState<TerminalRow[]>([]);
  const [position, setPosition] = useState<PositionRow | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) return;

    let active = true;

    async function refresh() {
      try {
        const headers = {
          apikey: supabaseAnonKey ?? "",
          Authorization: `Bearer ${supabaseAnonKey}`,
        };
        const [terminalResponse, positionResponse] = await Promise.all([
          fetch(
            `${supabaseUrl}/rest/v1/longcat_public_terminal?select=stage,status,asset,amount&status=eq.succeeded&order=created_at.desc&limit=1000`,
            { cache: "no-store", headers },
          ),
          fetch(`${supabaseUrl}/rest/v1/longcat_latest_position?select=side,notional_usdc,entry_price&market=eq.SOL&limit=1`, {
            cache: "no-store",
            headers,
          }),
        ]);

        if (!terminalResponse.ok || !positionResponse.ok) return;

        const nextTerminalRows = (await terminalResponse.json()) as TerminalRow[];
        const nextPositionRows = (await positionResponse.json()) as PositionRow[];

        if (!active) return;
        setTerminalRows(nextTerminalRows);
        setPosition(nextPositionRows[0] ?? null);
      } catch {
        // Keep the last verified public state during a transient network failure.
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
    const longSize = Math.abs(safeNumber(position?.notional_usdc));
    const entryPrice = safeNumber(position?.entry_price);
    const solBridged = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BRIDGE" && row.asset?.toUpperCase() === "SOL")
      .reduce((total, row) => total + safeNumber(row.amount), 0);
    const tokensBurned = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BURN" && ["LONGCAT", "$LONGCAT"].includes(row.asset?.toUpperCase() ?? ""))
      .reduce((total, row) => total + safeNumber(row.amount), 0);
    const status = position
      ? position.side.toLowerCase() === "long" && longSize > 0
        ? "LONG OPEN"
        : "FLAT"
      : "NOT PUBLISHED";

    return [
      { label: "STATUS", value: status },
      { label: "LONG SIZE", value: longSize > 0 ? money(longSize) : "NOT PUBLISHED" },
      { label: "ENTRY PRICE", value: entryPrice > 0 ? money(entryPrice) : "NOT PUBLISHED" },
      { label: "SOL BRIDGED", value: solBridged > 0 ? `${solBridged.toFixed(4)} SOL` : "NOT PUBLISHED" },
      { label: "$LONGCAT BURNED", value: tokensBurned > 0 ? tokenAmount(tokensBurned) : "NOT PUBLISHED" },
    ];
  }, [position, terminalRows]);

  return (
    <aside className="hero-terminal" aria-label="Live Longcat terminal">
      <div className="hero-terminal__head">
        <div>
          <span>LIVE</span>
          <strong>LONGCAT TERMINAL</strong>
        </div>
        <i aria-hidden="true" />
      </div>
      <div className="hero-terminal__grid" aria-live="polite">
        {metrics.map((metric) => (
          <div className="hero-terminal__metric" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        ))}
      </div>
      <Link className="button ghost hero-terminal__button" href="/dashboard">
        Enter Dashboard
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
