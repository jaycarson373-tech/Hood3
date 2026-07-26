import { createHmac } from "node:crypto";

export const ASTER_SYMBOL = "ANSEMUSDT";

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function decimals(value) {
  const text = String(value);
  const point = text.indexOf(".");
  return point === -1 ? 0 : text.length - point - 1;
}

export function floorToStep(value, step) {
  const numericStep = Number(step);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Aster order quantity must be greater than zero.");
  }
  if (!Number.isFinite(numericStep) || numericStep <= 0) {
    throw new Error("Aster market step size is invalid.");
  }

  const precision = decimals(step);
  const floored = Math.floor((value + Number.EPSILON) / numericStep) * numericStep;
  return Number(floored.toFixed(precision));
}

async function responseJson(response, label) {
  const text = await response.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }
  if (!response.ok || payload?.code < 0) {
    throw new Error(`${label} failed: ${response.status} ${text}`);
  }
  return payload;
}

export async function getAsterPublicPosition({
  rpcUrl = "https://tapi.asterdex.com/info",
  wallet,
}) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: Date.now(),
      jsonrpc: "2.0",
      method: "aster_getBalance",
      params: [wallet, "latest"],
    }),
  });
  const payload = await responseJson(response, "Aster public position");
  const positions =
    payload.result?.positions?.flatMap((group) => group.positions ?? []) ?? [];
  const raw = positions.find(
    (position) => position.symbol?.toUpperCase() === ASTER_SYMBOL,
  );
  if (!raw || numberValue(raw.positionAmount) === 0) return null;

  const amount = numberValue(raw.positionAmount);
  return {
    account: wallet,
    market: ASTER_SYMBOL,
    side: amount > 0 ? "long" : "short",
    size: Math.abs(amount),
    notionalUsdt: Math.abs(numberValue(raw.notionalValue)),
    entryPrice: numberValue(raw.entryPrice),
    markPrice: numberValue(raw.markPrice),
    leverage: numberValue(raw.leverage),
    unrealizedPnlUsdt: numberValue(raw.unrealizedProfit),
    marginUsedUsdt: Math.abs(numberValue(raw.marginValue)),
  };
}

export function createAsterClient({
  apiUrl = "https://fapi.asterdex.com",
  apiKey,
  apiSecret,
}) {
  async function publicGet(path, params = {}) {
    const query = new URLSearchParams(params);
    const response = await fetch(`${apiUrl}${path}?${query}`);
    return responseJson(response, `Aster ${path}`);
  }

  async function signed(method, path, params = {}) {
    const query = new URLSearchParams({
      ...params,
      recvWindow: "5000",
      timestamp: String(Date.now()),
    });
    const signature = createHmac("sha256", apiSecret)
      .update(query.toString())
      .digest("hex");
    query.set("signature", signature);
    const response = await fetch(`${apiUrl}${path}?${query}`, {
      method,
      headers: { "X-MBX-APIKEY": apiKey },
    });
    return responseJson(response, `Aster ${path}`);
  }

  return { publicGet, signed };
}

export async function inspectAsterMarket(client) {
  const [exchangeInfo, ticker] = await Promise.all([
    client.publicGet("/fapi/v1/exchangeInfo"),
    client.publicGet("/fapi/v1/ticker/24hr", { symbol: ASTER_SYMBOL }),
  ]);
  const market = exchangeInfo.symbols?.find(
    (item) => item.symbol === ASTER_SYMBOL && item.status === "TRADING",
  );
  if (!market) throw new Error("ANSEMUSDT is not trading on Aster.");
  const lot =
    market.filters?.find((filter) => filter.filterType === "MARKET_LOT_SIZE") ??
    market.filters?.find((filter) => filter.filterType === "LOT_SIZE");

  return {
    symbol: ASTER_SYMBOL,
    price: numberValue(ticker.lastPrice),
    stepSize: lot?.stepSize,
    minQty: numberValue(lot?.minQty),
  };
}

export async function getAsterAvailableUsdt(client) {
  const balances = await client.signed("GET", "/fapi/v2/balance");
  const usdt = balances.find((balance) => balance.asset === "USDT");
  return numberValue(usdt?.availableBalance ?? usdt?.balance);
}

export async function openAsterLong({
  client,
  market,
  collateralUsdt,
  leverage,
}) {
  await client.signed("POST", "/fapi/v1/leverage", {
    symbol: market.symbol,
    leverage: String(leverage),
  });

  const notionalUsdt = collateralUsdt * leverage;
  const quantity = floorToStep(notionalUsdt / market.price, market.stepSize);
  if (quantity < market.minQty) {
    throw new Error("Aster order quantity is below the market minimum.");
  }

  const order = await client.signed("POST", "/fapi/v1/order", {
    symbol: market.symbol,
    side: "BUY",
    type: "MARKET",
    quantity: String(quantity),
    newOrderRespType: "RESULT",
  });

  return {
    orderId: String(order.orderId ?? order.clientOrderId ?? ""),
    quantity: numberValue(order.executedQty ?? quantity),
    averagePrice: numberValue(order.avgPrice ?? market.price),
    collateralUsdt,
    notionalUsdt,
    raw: order,
  };
}
