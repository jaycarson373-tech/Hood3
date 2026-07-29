"use client";

import { useEffect, useState } from "react";

type ActivityRow = {
  id: number;
  stage: string;
  asset: string | null;
  amount: string | number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function eventLabel(stage: string) {
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

  return labels[stage.toUpperCase()] ?? "Strategy receipt recorded";
}

function amountLabel(row: ActivityRow) {
  const amount = Number(row.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const rawAsset = row.asset?.toUpperCase() ?? "";
  const asset =
    rawAsset === "BBL" || rawAsset === "$BBL" ? "$HEDGE" : rawAsset;

  if (asset === "USD" || asset === "USDC" || asset === "USDT") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  if (asset === "SOL") return `${amount.toFixed(4)} SOL`;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(amount)}${asset ? ` ${asset}` : ""}`;
}

export function ActivityTicker() {
  const [rows, setRows] = useState<ActivityRow[]>([]);

  useEffect(() => {
    let active = true;

    async function refresh() {
      if (!supabaseUrl || !supabaseAnonKey) return;

      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/bbl_public_terminal?select=id,stage,asset,amount&status=eq.succeeded&order=created_at.desc&limit=12`,
          {
            cache: "no-store",
            headers: {
              apikey: supabaseAnonKey,
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
          },
        );

        if (active && response.ok) {
          setRows((await response.json()) as ActivityRow[]);
        }
      } catch {
        // Keep the last verified tape during transient provider failures.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 15_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!rows.length) return null;

  const tickerRows = [...rows, ...rows];

  return (
    <aside className="activity-ticker" aria-label="Verified strategy activity">
      <span className="activity-ticker-label">LIVE TAPE</span>
      <div className="activity-ticker-window">
        <div className="activity-ticker-track">
          {tickerRows.map((row, index) => (
            <span key={`${row.id}-${index}`}>
              <strong>{eventLabel(row.stage)}</strong>
              {amountLabel(row) ? <em>{amountLabel(row)}</em> : null}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
