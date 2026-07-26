const configuredSiteUrl = process.env.SITE_URL?.trim();

export const SITE = {
  name: "BBL",
  title: "BBL | Black Bull Long",
  description:
    "Black Bull Long turns creator fees into a public ANSEM position. Qualifying realized profits buy back and burn $BBL.",
  configuredUrl: configuredSiteUrl || null,
  ogImage: "/bbl-banner.jpg",
} as const;

export const ANSEM = {
  name: "The Black Bull",
  symbol: "ANSEM",
  address: "9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump",
  pairAddress: "FnzKY6x7entQ1eR3D225dQyT7ybfka4PskBMQhb8L3CC",
  dexScreenerUrl:
    "https://dexscreener.com/solana/fnzky6x7entq1er3d225dqyt7ybfka4pskbmqhb8l3cc",
  hyperliquidSpotUrl: "https://app.hyperliquid.xyz/trade/ANSEM/USDC",
  officialSiteUrl: "https://www.blackbullsol.com/",
  officialXUrl: "https://x.com/blackbullsol",
  ansemXUrl: "https://x.com/blknoiz06",
} as const;

export const BBL_CONTRACT_ADDRESS =
  process.env.BBL_TOKEN_ADDRESS?.trim() ||
  "3LdsM35gCW2u99taAN6kKChhkGNR5yMDzAb15vcRpump";

export const EXECUTION = {
  hyperliquidAccount:
    process.env.NEXT_PUBLIC_BBL_HYPERLIQUID_ACCOUNT?.trim() || null,
} as const;

export const EXTERNAL_LINKS: {
  buy: string | null;
  dexScreener: string | null;
  x: string | null;
  community: string | null;
  position: string | null;
  ansemMarket: string;
} = {
  buy: process.env.NEXT_PUBLIC_BBL_BUY_URL?.trim() || null,
  dexScreener:
    process.env.NEXT_PUBLIC_BBL_DEXSCREENER_URL?.trim() ||
    `https://dexscreener.com/solana/${BBL_CONTRACT_ADDRESS}`,
  x:
    process.env.NEXT_PUBLIC_BBL_X_URL?.trim() ||
    "https://x.com/BlackBullLong",
  community: process.env.NEXT_PUBLIC_BBL_COMMUNITY_URL?.trim() || null,
  position: EXECUTION.hyperliquidAccount
    ? `https://app.hyperliquid.xyz/explorer/address/${EXECUTION.hyperliquidAccount}`
    : null,
  ansemMarket: ANSEM.hyperliquidSpotUrl,
};

export type SiteLink = {
  label: string;
  href: string;
};

const optionalLinks: Array<[string, string | null]> = [
  ["Buy $BBL", EXTERNAL_LINKS.buy],
  ["DexScreener", EXTERNAL_LINKS.dexScreener],
  ["X", EXTERNAL_LINKS.x],
  ["Community", EXTERNAL_LINKS.community],
  ["Position", EXTERNAL_LINKS.position],
];

export const externalLinks: SiteLink[] = optionalLinks.flatMap(([label, href]) =>
  href ? [{ label, href }] : [],
);
