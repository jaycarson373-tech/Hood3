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
  apiWalletPrivateKey,
}) {
  const transport = new HttpTransport({ apiUrl, timeout: 15_000 });
  const agentWallet = privateKeyToAccount(
    normalizePrivateKey(apiWalletPrivateKey, "HYPERLIQUID_API_WALLET_PRIVATE_KEY"),
  );

  return {
    agent: new ExchangeClient({ transport, wallet: agentWallet }),
  };
}

export async function inspectHyperliquid(info, account) {
  const [spotMeta, mids, spotState] = await Promise.all([
    info.spotMeta(),
    info.allMids(),
    info.spotClearinghouseState({ user: account }),
  ]);

  const unitSol = spotMeta.tokens.find(
    (token) => token.name === "USOL" || token.fullName === "Unit Solana",
  );
  const unitAnsem = spotMeta.tokens.find(
    (token) => token.name === "UANSEM" || token.fullName === "Unit Ansem",
  );
  const usdc = spotMeta.tokens.find((token) => token.name === "USDC");
  if (!unitSol || !unitAnsem || !usdc) {
    throw new Error("Hyperliquid Unit SOL, Unit ANSEM, or USDC metadata is unavailable.");
  }

  const solSpotUniverse = spotMeta.universe.find(
    (market) => market.tokens[0] === unitSol.index && market.tokens[1] === usdc.index,
  );
  const ansemSpotUniverse = spotMeta.universe.find(
    (market) => market.tokens[0] === unitAnsem.index && market.tokens[1] === usdc.index,
  );
  if (!solSpotUniverse || !ansemSpotUniverse) {
    throw new Error("Hyperliquid Unit SOL/USDC spot market is unavailable.");
  }

  const solSpotMid = Number(mids[`@${solSpotUniverse.index}`]);
  const ansemSpotMid = Number(mids[`@${ansemSpotUniverse.index}`]);
  if (!Number.isFinite(solSpotMid) || !Number.isFinite(ansemSpotMid)) {
    throw new Error("Hyperliquid SOL or ANSEM spot price is unavailable.");
  }

  return {
    spotState,
    availableUnitSol: availableBalance(spotState, unitSol.name),
    availableUnitAnsem: availableBalance(spotState, unitAnsem.name),
    availableSpotUsdc: availableBalance(spotState, "USDC"),
    solSpotMarket: {
      assetId: 10_000 + solSpotUniverse.index,
      coin: `@${solSpotUniverse.index}`,
      szDecimals: unitSol.szDecimals,
      mid: solSpotMid,
    },
    ansemSpotMarket: {
      assetId: 10_000 + ansemSpotUniverse.index,
      coin: `@${ansemSpotUniverse.index}`,
      szDecimals: unitAnsem.szDecimals,
      mid: ansemSpotMid,
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

export async function buyAnsemSpot({
  exchange,
  market,
  amountUsdc,
  slippageBps,
}) {
  const size = formatSize(amountUsdc / market.mid, market.szDecimals);
  const limitPrice = formatPrice(
    market.mid * (1 + slippageBps / 10_000),
    8 - market.szDecimals,
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
    amountUsdc,
    amountAnsem: Number(fill.totalSz),
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
