import { ANSEM } from "../../constants";

export const dynamic = "force-dynamic";

type DexPair = {
  url?: string;
  priceUsd?: string;
  priceChange?: {
    h24?: number;
  };
  marketCap?: number;
  liquidity?: {
    usd?: number;
  };
  baseToken?: {
    address?: string;
    symbol?: string;
  };
};

type MarketSnapshot = {
  symbol: string;
  address: string;
  priceUsd: number;
  change24h: number | null;
  marketCapUsd: number | null;
  marketUrl: string | null;
};

function safeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getTokenSnapshot(
  address: string,
  symbol: string,
): Promise<MarketSnapshot | null> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/token-pairs/v1/solana/${address}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      },
    );

    if (!response.ok) return null;

    const pairs = (await response.json()) as DexPair[];
    const matchingPairs = pairs.filter(
      (pair) =>
        pair.baseToken?.address === address && safeNumber(pair.priceUsd),
    );
    const bestPair = matchingPairs.sort(
      (left, right) =>
        (right.liquidity?.usd ?? 0) - (left.liquidity?.usd ?? 0),
    )[0];
    const priceUsd = safeNumber(bestPair?.priceUsd);

    if (!bestPair || priceUsd === null) return null;

    return {
      symbol,
      address,
      priceUsd,
      change24h: safeNumber(bestPair.priceChange?.h24),
      marketCapUsd: safeNumber(bestPair.marketCap),
      marketUrl: bestPair.url || null,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const bblAddress = process.env.BBL_TOKEN_ADDRESS?.trim() || null;
  const [ansem, bbl] = await Promise.all([
    getTokenSnapshot(ANSEM.address, ANSEM.symbol),
    bblAddress ? getTokenSnapshot(bblAddress, "BBL") : Promise.resolve(null),
  ]);

  return Response.json(
    { ansem, bbl },
    {
      headers: {
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
}
