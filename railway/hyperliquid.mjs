export const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";
export const DEFAULT_HYPERLIQUID_DEXS = ["xyz", "vntl", "cash", "para"];

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseDexs(value) {
  const values = value
    ? value.split(",")
    : DEFAULT_HYPERLIQUID_DEXS;

  return [...new Set(values.map((dex) => dex.trim()).filter(Boolean))];
}

export function normalizeShortPositions(state, dex) {
  return (state?.assetPositions ?? []).flatMap(({ position }) => {
    if (!position) return [];
    const signedSize = numberValue(position.szi);
    if (!(signedSize < 0)) return [];

    const size = Math.abs(signedSize);
    const notionalUsd = Math.abs(numberValue(position.positionValue));

    return [
      {
        dex,
        market: position.coin || `${dex}:UNKNOWN`,
        side: "short",
        size,
        notionalUsd,
        entryPrice: numberValue(position.entryPx) || null,
        markPrice:
          size > 0 && notionalUsd > 0 ? notionalUsd / size : null,
        leverage: numberValue(position.leverage?.value) || null,
        unrealizedPnlUsd: numberValue(position.unrealizedPnl),
        marginUsedUsd: Math.abs(numberValue(position.marginUsed)),
        liquidationPrice: numberValue(position.liquidationPx) || null,
      },
    ];
  });
}

async function readDexState({ account, dex, infoUrl }) {
  const response = await fetch(infoUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "clearinghouseState",
      user: account,
      dex,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid ${dex} account request failed`);
  }

  return response.json();
}

export async function getHyperliquidShortBook({
  account,
  dexs = DEFAULT_HYPERLIQUID_DEXS,
  infoUrl = HYPERLIQUID_INFO_URL,
}) {
  const results = await Promise.allSettled(
    dexs.map(async (dex) => ({
      dex,
      state: await readDexState({ account, dex, infoUrl }),
    })),
  );
  const successful = results.flatMap((result) =>
    result.status === "fulfilled" ? [result.value] : [],
  );

  if (!successful.length) {
    throw new Error("Every configured Hyperliquid account read failed.");
  }

  const positions = successful.flatMap(({ dex, state }) =>
    normalizeShortPositions(state, dex),
  );
  const accountValueUsd = Math.max(
    0,
    ...successful.map(({ state }) =>
      numberValue(state?.marginSummary?.accountValue),
    ),
  );

  return {
    account,
    dexs: successful.map(({ dex }) => dex),
    positions,
    accountValueUsd,
  };
}
