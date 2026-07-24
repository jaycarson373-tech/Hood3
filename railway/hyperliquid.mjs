import {
  ExchangeClient,
  HttpTransport,
  InfoClient,
} from "@nktkas/hyperliquid";
import { privateKeyToAccount } from "viem/accounts";

function normalizePrivateKey(value, name) {
  const key = String(value ?? "").trim();
  if (!key) throw new Error(`Missing required env: ${name}`);
  return key.startsWith("0x") ? key : `0x${key}`;
}

export function floorDecimal(value, decimals) {
  const factor = 10 ** decimals;
  return Math.floor((value + Number.EPSILON) * factor) / factor;
}

export function formatSize(value, decimals) {
  const fixed = floorDecimal(value, decimals).toFixed(decimals);
  const formatted = fixed.includes(".")
    ? fixed.replace(/0+$/, "").replace(/\.$/, "")
    : fixed;
  if (Number(formatted) <= 0) {
    throw new Error(`Amount ${value} is below the ${decimals}-decimal lot size.`);
  }
  return formatted;
}

export function formatPrice(value, maxDecimals) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Hyperliquid order price must be greater than zero.");
  }
  const integerDigits = Math.floor(Math.log10(value)) + 1;
  const significantDecimals = Math.max(0, 5 - integerDigits);
  const decimals = Math.max(0, Math.min(maxDecimals, significantDecimals));
  return Number(value.toFixed(decimals)).toString();
}

function availableBalance(spotState, coin) {
  const balance = spotState.balances.find((row) => row.coin === coin);
  if (!balance) return 0;
  return Math.max(0, Number(balance.total) - Number(balance.hold));
}

function filledOrder(result) {
  const status = result?.response?.data?.statuses?.[0];
  if (status?.filled) return status.filled;
  if (status?.error) throw new Error(`Hyperliquid order failed: ${status.error}`);
  throw new Error(`Hyperliquid order was not filled: ${JSON.stringify(status ?? result)}`);
}

export function createHyperliquidPublicClient(apiUrl) {
  const transport = new HttpTransport({ apiUrl, timeout: 15_000 });
  return new InfoClient({ transport });
}

export function createHyperliquidExecutionClients({
  apiUrl,
  account,
  apiWalletPrivateKey,
  masterWalletPrivateKey,
}) {
  const transport = new HttpTransport({ apiUrl, timeout: 15_000 });
  const agentWallet = privateKeyToAccount(
    normalizePrivateKey(apiWalletPrivateKey, "HYPERLIQUID_API_WALLET_PRIVATE_KEY"),
  );
  const masterWallet = privateKeyToAccount(
    normalizePrivateKey(masterWalletPrivateKey, "HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY"),
  );

  if (masterWallet.address.toLowerCase() !== account.toLowerCase()) {
    throw new Error(
      `HYPERLIQUID_MASTER_WALLET_PRIVATE_KEY derives ${masterWallet.address}, not LONGCAT_HYPERLIQUID_ACCOUNT.`,
    );
  }

  return {
    agent: new ExchangeClient({ transport, wallet: agentWallet }),
    master: new ExchangeClient({ transport, wallet: masterWallet }),
  };
}

export async function inspectHyperliquid(info, account) {
  const [spotMeta, perpMeta, mids, spotState, perpState] = await Promise.all([
    info.spotMeta(),
    info.meta(),
    info.allMids(),
    info.spotClearinghouseState({ user: account }),
    info.clearinghouseState({ user: account }),
  ]);

  const unitSol = spotMeta.tokens.find(
    (token) => token.name === "USOL" || token.fullName === "Unit Solana",
  );
  const usdc = spotMeta.tokens.find((token) => token.name === "USDC");
  if (!unitSol || !usdc) {
    throw new Error("Hyperliquid Unit SOL/USDC metadata is unavailable.");
  }

  const spotUniverse = spotMeta.universe.find(
    (market) => market.tokens[0] === unitSol.index && market.tokens[1] === usdc.index,
  );
  if (!spotUniverse) {
    throw new Error("Hyperliquid Unit SOL/USDC spot market is unavailable.");
  }

  const perpIndex = perpMeta.universe.findIndex((market) => market.name === "SOL");
  if (perpIndex < 0) {
    throw new Error("Hyperliquid SOL perpetual market is unavailable.");
  }

  const perpMarket = perpMeta.universe[perpIndex];
  const spotMid = Number(mids[`@${spotUniverse.index}`]);
  const perpMid = Number(mids.SOL);
  if (!Number.isFinite(spotMid) || !Number.isFinite(perpMid)) {
    throw new Error("Hyperliquid SOL market prices are unavailable.");
  }

  return {
    spotState,
    perpState,
    availableUnitSol: availableBalance(spotState, unitSol.name),
    availableSpotUsdc: availableBalance(spotState, "USDC"),
    spotMarket: {
      assetId: 10_000 + spotUniverse.index,
      coin: `@${spotUniverse.index}`,
      szDecimals: unitSol.szDecimals,
      mid: spotMid,
    },
    perpMarket: {
      assetId: perpIndex,
      coin: "SOL",
      szDecimals: perpMarket.szDecimals,
      maxLeverage: perpMarket.maxLeverage,
      mid: perpMid,
    },
  };
}

export async function sellUnitSolForUsdc({
  exchange,
  market,
  amountSol,
  slippageBps,
}) {
  const size = formatSize(amountSol, market.szDecimals);
  const limitPrice = formatPrice(
    market.mid * (1 - slippageBps / 10_000),
    8 - market.szDecimals,
  );

  const result = await exchange.order({
    orders: [{
      a: market.assetId,
      b: false,
      p: limitPrice,
      s: size,
      r: false,
      t: { limit: { tif: "Ioc" } },
    }],
    grouping: "na",
  });
  const fill = filledOrder(result);

  return {
    amountSol: Number(fill.totalSz),
    averagePrice: Number(fill.avgPx),
    orderId: String(fill.oid),
    limitPrice: Number(limitPrice),
    raw: result,
  };
}

export async function transferSpotUsdcToPerps({ exchange, amountUsdc }) {
  const amount = formatSize(amountUsdc, 6);
  const result = await exchange.usdClassTransfer({
    amount,
    toPerp: true,
  });
  return { amountUsdc: Number(amount), raw: result };
}

export async function openSolLong({
  exchange,
  market,
  collateralUsdc,
  leverage,
  slippageBps,
  collateralUtilization,
}) {
  if (leverage > market.maxLeverage) {
    throw new Error(
      `Configured leverage ${leverage}x exceeds Hyperliquid SOL maximum ${market.maxLeverage}x.`,
    );
  }

  await exchange.updateLeverage({
    asset: market.assetId,
    isCross: true,
    leverage,
  });

  const notionalUsdc = collateralUsdc * leverage * collateralUtilization;
  const size = formatSize(notionalUsdc / market.mid, market.szDecimals);
  const limitPrice = formatPrice(
    market.mid * (1 + slippageBps / 10_000),
    6 - market.szDecimals,
  );
  const result = await exchange.order({
    orders: [{
      a: market.assetId,
      b: true,
      p: limitPrice,
      s: size,
      r: false,
      t: { limit: { tif: "Ioc" } },
    }],
    grouping: "na",
  });
  const fill = filledOrder(result);

  return {
    collateralUsdc,
    notionalUsdc,
    leverage,
    amountSol: Number(fill.totalSz),
    averagePrice: Number(fill.avgPx),
    orderId: String(fill.oid),
    limitPrice: Number(limitPrice),
    raw: result,
  };
}

export async function waitForUnitSolCredit({
  info,
  account,
  startingBalance,
  timeoutSeconds,
}) {
  const deadline = Date.now() + timeoutSeconds * 1_000;

  while (Date.now() < deadline) {
    const state = await info.spotClearinghouseState({ user: account });
    const balance = availableBalance(state, "USOL");
    if (balance > startingBalance) return balance;
    await new Promise((resolve) => setTimeout(resolve, 10_000));
  }

  return startingBalance;
}
