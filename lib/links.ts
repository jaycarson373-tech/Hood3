export const CA = "3LdsM35gCW2u99taAN6kKChhkGNR5yMDzAb15vcRpump";

export const PUMP_FUN_URL = `https://pump.fun/coin/${CA}`;
export const DEXSCREENER_URL = `https://dexscreener.com/solana/${CA}`;
export const ASTER_MARKET_URL =
  "https://www.asterdex.com/en/trade/pro/futures/ANSEMUSDT";

// TODO: Replace with Aster's public account URL when one is available.
export const ASTER_ACCOUNT_URL: string | null = null;
export const POSITION_URL = ASTER_ACCOUNT_URL ?? ASTER_MARKET_URL;

export const X_URL =
  process.env.NEXT_PUBLIC_HEDGE_X_URL?.trim() || null;
export const COMMUNITY_URL =
  process.env.NEXT_PUBLIC_HEDGE_COMMUNITY_URL?.trim() || null;

export const ASTER_PUBLIC_RPC_URL = "https://tapi.asterdex.com/info";
export const DEXSCREENER_TOKEN_PAIRS_API_URL =
  "https://api.dexscreener.com/token-pairs/v1/solana";
