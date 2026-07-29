import {
  ASTER_MARKET_URL,
  CA,
  COMMUNITY_URL,
  DEXSCREENER_URL,
  POSITION_URL,
  PUMP_FUN_URL,
  X_URL,
} from "../lib/links";

const configuredSiteUrl = process.env.SITE_URL?.trim();

export const SITE = {
  name: "Hedge the Hedgehog",
  title: "Hedge the Hedgehog | $HEDGE",
  description:
    "The first perpetual hedge fund on Solana. Creator fees fund a transparent perpetual strategy; qualifying profits buy back and burn $HEDGE.",
  configuredUrl: configuredSiteUrl || null,
  ogImage: "/hedge-banner.jpg",
} as const;

export const HEDGE_CONTRACT_ADDRESS = CA;

export const EXECUTION = {
  asterWallet:
    process.env.HEDGE_ASTER_WALLET_ADDRESS?.trim() ||
    process.env.BBL_ASTER_WALLET_ADDRESS?.trim() ||
    "0xe7BdaB66180a514bb591E2cD6874e58CE5809488",
  marketUrl: ASTER_MARKET_URL,
} as const;

export const EXTERNAL_LINKS = {
  buy: PUMP_FUN_URL,
  chart: DEXSCREENER_URL,
  x: X_URL,
  community: COMMUNITY_URL,
  position: POSITION_URL,
  exchange: ASTER_MARKET_URL,
} as const;

export type SiteLink = {
  label: string;
  href: string;
};

const optionalLinks: Array<[string, string | null]> = [
  ["Buy $HEDGE", EXTERNAL_LINKS.buy],
  ["Chart", EXTERNAL_LINKS.chart],
  ["Position", EXTERNAL_LINKS.position],
  ["X", EXTERNAL_LINKS.x],
  ["Community", EXTERNAL_LINKS.community],
];

export const externalLinks: SiteLink[] = optionalLinks.flatMap(([label, href]) =>
  href ? [{ label, href }] : [],
);
