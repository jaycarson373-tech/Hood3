import { EXECUTION } from "../../constants";
import { ASTER_PUBLIC_RPC_URL } from "../../../lib/links";

export const dynamic = "force-dynamic";

const EXECUTION_MARKET =
  process.env.HEDGE_ASTER_MARKET?.trim().toUpperCase() || "ANSEMUSDT";

type AsterPosition = {
  symbol?: string;
  positionAmount?: string | number;
  entryPrice?: string | number;
  unrealizedProfit?: string | number;
  notionalValue?: string | number;
  markPrice?: string | number;
  leverage?: string | number;
  marginValue?: string | number;
};

type AsterPositionGroup = {
  positions?: AsterPosition[];
};

type AsterBalanceResponse = {
  result?: {
    positions?: AsterPositionGroup[];
  };
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function GET() {
  const wallet = EXECUTION.asterWallet;
  if (!wallet) {
    return Response.json({ configured: false, position: null });
  }

  try {
    const response = await fetch(ASTER_PUBLIC_RPC_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: Date.now(),
        jsonrpc: "2.0",
        method: "aster_getBalance",
        params: [wallet, "latest"],
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Aster position request failed");

    const payload = (await response.json()) as AsterBalanceResponse;
    const positions = payload.result?.positions?.flatMap(
      (group) => group.positions ?? [],
    ) ?? [];
    const rawPosition = positions.find(
      (position) => position.symbol?.toUpperCase() === EXECUTION_MARKET,
    );
    const amount = numberValue(rawPosition?.positionAmount);

    if (!rawPosition || amount === 0) {
      return Response.json({ configured: true, position: null });
    }

    return Response.json({
      configured: true,
      position: {
        recorded_at: new Date().toISOString(),
        aster_account: wallet,
        market: EXECUTION_MARKET,
        side: amount > 0 ? "long" : "short",
        size: Math.abs(amount),
        notional_usdc: Math.abs(numberValue(rawPosition.notionalValue)),
        entry_price: numberValue(rawPosition.entryPrice),
        mark_price: numberValue(rawPosition.markPrice),
        leverage: numberValue(rawPosition.leverage),
        unrealized_pnl_usdc: numberValue(rawPosition.unrealizedProfit),
        margin_used_usdc: Math.abs(numberValue(rawPosition.marginValue)),
        market_url: EXECUTION.marketUrl,
      },
    });
  } catch {
    return Response.json(
      { configured: true, position: null, unavailable: true },
      { status: 503 },
    );
  }
}
