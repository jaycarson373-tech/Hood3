import {
  HYPERLIQUID_ACCOUNT_URL,
  HYPERLIQUID_INFO_URL,
} from "../../../lib/links";

export const dynamic = "force-dynamic";

type HyperliquidPosition = {
  coin?: string;
  szi?: string | number;
  entryPx?: string | number;
  positionValue?: string | number;
  unrealizedPnl?: string | number;
  marginUsed?: string | number;
  liquidationPx?: string | number | null;
  leverage?: {
    value?: string | number;
  };
};

type HyperliquidState = {
  marginSummary?: {
    accountValue?: string | number;
    totalMarginUsed?: string | number;
  };
  assetPositions?: Array<{
    position?: HyperliquidPosition;
  }>;
  time?: number;
};

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function configuredDexs() {
  const configured = process.env.HEDGE_HYPERLIQUID_DEXS?.trim();
  const values = configured
    ? configured.split(",")
    : ["xyz", "vntl", "cash", "para"];

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

async function readDexState(user: string, dex: string) {
  const response = await fetch(HYPERLIQUID_INFO_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "clearinghouseState",
      user,
      dex,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid ${dex} account request failed`);
  }

  return (await response.json()) as HyperliquidState;
}

export async function GET() {
  const account =
    process.env.HEDGE_HYPERLIQUID_ACCOUNT?.trim() ||
    process.env.NEXT_PUBLIC_HEDGE_HYPERLIQUID_ACCOUNT?.trim();

  if (!account || !/^0x[a-fA-F0-9]{40}$/.test(account)) {
    return Response.json({
      configured: false,
      account: null,
      account_url: null,
      positions: [],
      summary: null,
    });
  }

  const dexs = configuredDexs();
  const results = await Promise.allSettled(
    dexs.map(async (dex) => ({
      dex,
      state: await readDexState(account, dex),
    })),
  );
  const successful = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  if (!successful.length) {
    return Response.json(
      {
        configured: true,
        account,
        account_url: HYPERLIQUID_ACCOUNT_URL(account),
        positions: [],
        summary: null,
        unavailable: true,
      },
      { status: 503 },
    );
  }

  const positions = successful.flatMap(({ dex, state }) =>
    (state.assetPositions ?? []).flatMap(({ position }) => {
      if (!position) return [];
      const signedSize = numberValue(position.szi);
      if (!(signedSize < 0)) return [];

      const notional = Math.abs(numberValue(position.positionValue));
      const size = Math.abs(signedSize);

      return [
        {
          market: position.coin || `${dex}:UNKNOWN`,
          dex,
          side: "short",
          size,
          notional_usd: notional,
          entry_price: numberValue(position.entryPx) || null,
          mark_price: size > 0 && notional > 0 ? notional / size : null,
          leverage: numberValue(position.leverage?.value) || null,
          unrealized_pnl_usd: numberValue(position.unrealizedPnl),
          margin_used_usd: Math.abs(numberValue(position.marginUsed)),
          liquidation_price: numberValue(position.liquidationPx) || null,
          recorded_at: state.time
            ? new Date(state.time).toISOString()
            : new Date().toISOString(),
        },
      ];
    }),
  );

  const summary = {
    short_count: positions.length,
    total_short_notional_usd: positions.reduce(
      (sum, position) => sum + position.notional_usd,
      0,
    ),
    total_margin_used_usd: positions.reduce(
      (sum, position) => sum + position.margin_used_usd,
      0,
    ),
    total_unrealized_pnl_usd: positions.reduce(
      (sum, position) => sum + position.unrealized_pnl_usd,
      0,
    ),
    account_value_usd: Math.max(
      0,
      ...successful.map(({ state }) =>
        numberValue(state.marginSummary?.accountValue),
      ),
    ),
  };

  return Response.json({
    configured: true,
    account,
    account_url: HYPERLIQUID_ACCOUNT_URL(account),
    dexs,
    positions,
    summary,
  });
}
