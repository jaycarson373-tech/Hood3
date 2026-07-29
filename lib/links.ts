export const CA =
  process.env.NEXT_PUBLIC_HEDGE_TOKEN_ADDRESS?.trim() ||
  "HTv34hJtJLrC62FXt8ea8rhv3YkaBCovVEmmHR6xpump";

export const PUMP_FUN_URL = CA ? `https://pump.fun/coin/${CA}` : null;
export const DEXSCREENER_URL = CA
  ? `https://dexscreener.com/solana/${CA}`
  : null;
export const HYPERLIQUID_TRADE_URL = "https://app.hyperliquid.xyz/trade";
export const HYPERLIQUID_EXPLORER_URL =
  "https://app.hyperliquid.xyz/explorer";
export const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";
export const HYPERLIQUID_ACCOUNT_URL = (account: string) =>
  `${HYPERLIQUID_EXPLORER_URL}/address/${account}`;

const configuredHyperliquidAccount =
  process.env.NEXT_PUBLIC_HEDGE_HYPERLIQUID_ACCOUNT?.trim() || null;
export const POSITION_URL = configuredHyperliquidAccount
  ? HYPERLIQUID_ACCOUNT_URL(configuredHyperliquidAccount)
  : HYPERLIQUID_EXPLORER_URL;

export const X_URL =
  process.env.NEXT_PUBLIC_HEDGE_X_URL?.trim() ||
  "https://x.com/Hedge_Sol_";
export const COMMUNITY_URL =
  process.env.NEXT_PUBLIC_HEDGE_COMMUNITY_URL?.trim() || null;

export const DEXSCREENER_TOKEN_PAIRS_API_URL =
  "https://api.dexscreener.com/token-pairs/v1/solana";
