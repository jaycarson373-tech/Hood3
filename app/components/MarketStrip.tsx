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
  ansem: Snapshot | null;
  bbl: Snapshot | null;
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

function compactMoney(value: number | null) {
  if (value === null) return null;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function MarketCell({ market }: { market: Snapshot }) {
  const change = market.change24h;

  return (
    <a
      className="market-cell"
      href={market.marketUrl || undefined}
      target="_blank"
      rel="noreferrer"
      aria-label={`View ${market.symbol} market`}
    >
      <span>${market.symbol} PRICE</span>
      <strong>{price(market.priceUsd)}</strong>
      <small className={change !== null && change < 0 ? "negative" : "positive"}>
        {change === null
          ? compactMoney(market.marketCapUsd)
          : `${change >= 0 ? "+" : ""}${change.toFixed(2)}% 24H`}
      </small>
    </a>
  );
}

export function MarketStrip() {
  const [markets, setMarkets] = useState<MarketPayload | null>(null);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as MarketPayload;
        if (active) setMarkets(payload);
      } catch {
        // Keep the last confirmed quote during a transient market-data failure.
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!markets?.ansem && !markets?.bbl) return null;

  return (
    <div className="market-strip" aria-label="Live token prices">
      {markets.ansem ? <MarketCell market={markets.ansem} /> : null}
      {markets.bbl ? <MarketCell market={markets.bbl} /> : null}
    </div>
  );
}
