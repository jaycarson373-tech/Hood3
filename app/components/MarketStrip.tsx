"use client";

import { useEffect, useState } from "react";

type Snapshot = {
  symbol: string;
  priceUsd: number;
  change24h: number | null;
  marketCapUsd: number | null;
  marketUrl: string | null;
};

type MarketPayload = {
  hedge: Snapshot | null;
};

function price(value: number) {
  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 4,
    }).format(value);
  }

  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  })}`;
}

export function MarketStrip() {
  const [market, setMarket] = useState<Snapshot | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as MarketPayload;
        if (active) setMarket(payload.hedge);
      } catch {
        // Retain the last verified quote during a transient provider failure.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!market) return null;

  return (
    <a
      className="market-strip"
      href={market.marketUrl || undefined}
      target="_blank"
      rel="noreferrer"
      aria-label="View the HEDGE market"
    >
      <span>LIVE / $HEDGE</span>
      <strong>{price(market.priceUsd)}</strong>
      {market.change24h !== null ? (
        <small className={market.change24h < 0 ? "negative" : "positive"}>
          {market.change24h >= 0 ? "+" : ""}
          {market.change24h.toFixed(2)}% / 24H
        </small>
      ) : null}
    </a>
  );
}
