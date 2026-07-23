"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HYPERLIQUID } from "../constants";

type TerminalRow = {
  stage: string;
  status: string;
  asset: string | null;
  amount: string | number | null;
};

type PositionRow = {
  side: string;
  size?: string | number;
  notional_usdc: string | number;
  entry_price: string | number | null;
  leverage?: string | number;
};

type HyperliquidPosition = {
  coin: string;
  szi: string;
  entryPx: string | null;
  positionValue: string;
  leverage: {
    type: string;
    value: number;
  };
};

type HyperliquidState = {
  assetPositions?: Array<{
    position: HyperliquidPosition;
  }>;
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
  const [hyperliquidPosition, setHyperliquidPosition] = useState<HyperliquidPosition | null>(null);
  const [hyperliquidLoaded, setHyperliquidLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    async function refreshHyperliquid() {
      try {
        const response = await fetch(HYPERLIQUID.apiUrl, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "clearinghouseState",
            user: HYPERLIQUID.account,
          }),
        });

        if (!response.ok) return;

        const state = (await response.json()) as HyperliquidState;
        const solPosition = state.assetPositions?.find(({ position: assetPosition }) => assetPosition.coin === "SOL")?.position ?? null;

        if (!active) return;
        setHyperliquidPosition(solPosition);
        setHyperliquidLoaded(true);
      } catch {
        // Keep the last verified Hyperliquid state during a transient network failure.
      }
    }

    async function refreshSupabase() {
      if (!supabaseUrl || !supabaseAnonKey) return;

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

    function refresh() {
      void Promise.all([refreshHyperliquid(), refreshSupabase()]);
    }

    refresh();
    const timer = window.setInterval(refresh, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const metrics = useMemo(() => {
    const solSize = Math.abs(safeNumber(hyperliquidPosition?.szi || position?.size));
    const longSize = Math.abs(safeNumber(hyperliquidPosition?.positionValue || position?.notional_usdc));
    const entryPrice = safeNumber(hyperliquidPosition?.entryPx || position?.entry_price);
    const leverage = safeNumber(hyperliquidPosition?.leverage.value || position?.leverage);
    const tokensBurned = terminalRows
      .filter((row) => row.stage.toUpperCase() === "BURN" && ["LONGCAT", "$LONGCAT"].includes(row.asset?.toUpperCase() ?? ""))
      .reduce((total, row) => total + safeNumber(row.amount), 0);
    const hasLong = solSize > 0 || longSize > 0;
    const status = hasLong
      ? leverage > 0
        ? `LONG · ${leverage.toFixed(0)}X`
        : "LONG OPEN"
      : hyperliquidLoaded || position
        ? "FLAT"
        : "NOT PUBLISHED";

    return [
      { label: "STATUS", value: status },
      { label: "SOL LONG", value: solSize > 0 ? `${solSize.toFixed(2)} SOL` : "NOT PUBLISHED" },
      { label: "POSITION VALUE", value: longSize > 0 ? money(longSize) : "NOT PUBLISHED" },
      { label: "ENTRY PRICE", value: entryPrice > 0 ? money(entryPrice) : "NOT PUBLISHED" },
      { label: "FIRST HL DEPOSIT", value: money(HYPERLIQUID.initialDepositUsd) },
      { label: "$LONGCAT BURNED", value: tokensBurned > 0 ? tokenAmount(tokensBurned) : "0" },
    ];
  }, [hyperliquidLoaded, hyperliquidPosition, position, terminalRows]);

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
