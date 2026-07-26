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
  size: string | number;
  notional_usdc: string | number;
  entry_price: string | number | null;
  leverage: string | number;
};

type AsterPositionResponse = {
  position: PositionRow | null;
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

function tokenAmount(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
  }).format(value);
}

export function HeroTerminal() {
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
        const [terminalResponse, asterResponse] = await Promise.all([
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
          setTerminalRows(
            (await terminalResponse.json()) as TerminalRow[],
          );
        }
        if (asterResponse.ok) {
          const payload = (await asterResponse.json()) as AsterPositionResponse;
          setPosition(payload.position);
        }
      } catch {
        // Keep the last verified public state during a transient failure.
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
    const positionSize = Math.abs(safeNumber(position?.size));
    const positionValue = Math.abs(safeNumber(position?.notional_usdc));
    const entryPrice = safeNumber(position?.entry_price);
    const leverage = safeNumber(position?.leverage);
    const feesDeployed = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "CLAIM" &&
          row.status.toLowerCase() === "succeeded",
      )
      .reduce((total, row) => total + safeNumber(row.amount), 0);
    const tokensBurned = terminalRows
      .filter(
        (row) =>
          row.stage.toUpperCase() === "BURN" &&
          ["BBL", "$BBL"].includes(row.asset?.toUpperCase() ?? ""),
      )
      .reduce((total, row) => total + safeNumber(row.amount), 0);
    const hasPosition = positionSize > 0 || positionValue > 0;

    return [
      {
        label: "ENGINE STATUS",
        value: hasPosition ? "ASTER LONG LIVE" : "NO POSITION PUBLISHED",
      },
      {
        label: "ANSEMUSDT LONG",
        value:
          positionSize > 0
            ? `${tokenAmount(positionSize, 0)} ANSEM`
            : "NO PUBLIC RECEIPT",
      },
      {
        label: "POSITION VALUE",
        value:
          positionValue > 0 ? money(positionValue) : "NO PUBLIC RECEIPT",
      },
      {
        label: "LEVERAGE",
        value: leverage > 0 ? `${leverage.toFixed(0)}x` : "NO PUBLIC RECEIPT",
      },
      {
        label: "AVERAGE ENTRY",
        value: entryPrice > 0 ? money(entryPrice) : "NO PUBLIC RECEIPT",
      },
      {
        label: "FEES DEPLOYED",
        value: feesDeployed > 0 ? `${feesDeployed.toFixed(4)} SOL` : "NO PUBLIC RECEIPT",
      },
      {
        label: "$BBL BURNED",
        value: tokensBurned > 0 ? tokenAmount(tokensBurned) : "NO PUBLIC RECEIPT",
      },
    ];
  }, [position, terminalRows]);

  return (
    <aside className="hero-terminal" aria-label="Live BBL Aster terminal">
      <div className="hero-terminal__head">
        <div>
          <span>PUBLIC FEED</span>
          <strong>BLACK BULL TERMINAL</strong>
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
      <Link className="button terminal-button" href="/dashboard">
        Enter Dashboard
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
