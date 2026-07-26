import {
  ANSEM_CA,
  ANSEM_MARKET_URL,
  ANSEM_OFFICIAL_SITE_URL,
  ANSEM_OFFICIAL_X_URL,
  ANSEM_PAIR_ADDRESS,
  ANSEM_X_URL,
  ASTER_MARKET_URL,
  CA,
  DEXSCREENER_URL,
  POSITION_URL,
  PUMP_FUN_URL,
  X_URL,
} from "../lib/links";

const configuredSiteUrl = process.env.SITE_URL?.trim();

export const SITE = {
  name: "BBL",
  title: "BBL | Black Bull Long",
  description:
    "Black Bull Long turns creator fees into a public ANSEMUSDT 5x long on Aster. Qualifying realized profits buy back and burn $BBL.",
  configuredUrl: configuredSiteUrl || null,
  ogImage: "/bbl-banner.jpg",
} as const;

export const ANSEM = {
  name: "The Black Bull",
  symbol: "ANSEM",
  address: ANSEM_CA,
  pairAddress: ANSEM_PAIR_ADDRESS,
  dexScreenerUrl: ANSEM_MARKET_URL,
  asterMarketUrl: ASTER_MARKET_URL,
  officialSiteUrl: ANSEM_OFFICIAL_SITE_URL,
  officialXUrl: ANSEM_OFFICIAL_X_URL,
  ansemXUrl: ANSEM_X_URL,
} as const;

export const BBL_CONTRACT_ADDRESS = CA;

export const EXECUTION = {
  asterWallet:
    process.env.BBL_ASTER_WALLET_ADDRESS?.trim() ||
    "0xe7BdaB66180a514bb591E2cD6874e58CE5809488",
} as const;

export const EXTERNAL_LINKS: {
  buy: string | null;
  dexScreener: string | null;
  x: string | null;
  community: string | null;
  position: string | null;
  ansemMarket: string;
} = {
  buy: PUMP_FUN_URL,
  dexScreener: DEXSCREENER_URL,
  x: X_URL,
  community: process.env.NEXT_PUBLIC_BBL_COMMUNITY_URL?.trim() || null,
  position: POSITION_URL,
  ansemMarket: ANSEM_MARKET_URL,
};

export type SiteLink = {
  label: string;
  href: string;
};

const optionalLinks: Array<[string, string | null]> = [
  ["Pump.fun", EXTERNAL_LINKS.buy],
  ["DexScreener", EXTERNAL_LINKS.dexScreener],
  ["X", EXTERNAL_LINKS.x],
  ["Community", EXTERNAL_LINKS.community],
  ["Position", EXTERNAL_LINKS.position],
];

export const externalLinks: SiteLink[] = optionalLinks.flatMap(([label, href]) =>
  href ? [{ label, href }] : [],
);
