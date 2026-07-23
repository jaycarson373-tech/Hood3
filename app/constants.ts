export const SITE = {
  name: "Long Cat",
  title: "Long Cat | The Longest Cat on Solana",
  description:
    "Long Cat is a Solana native leverage token: creator fees build a public SOL long on Hyperliquid, and qualifying realized profits buy back and burn $LONGCAT.",
  url: "https://www.longcatsolana.fun",
  ogImage: "/og.png",
} as const;

export const CONTRACT_ADDRESS: string | null = null;

export const HYPERLIQUID = {
  account: "0x68F6723727EF5306122D666F92bEDF4d8382E2Fc",
  apiUrl: "https://api.hyperliquid.xyz/info",
  initialDepositUsd: 96,
} as const;

export const EXTERNAL_LINKS: {
  pump: string | null;
  dexScreener: string | null;
  x: string | null;
  community: string | null;
  hyperliquidPosition: string | null;
  solMarket: string | null;
  buy: string | null;
} = {
  pump: null,
  dexScreener: null,
  x: null,
  community: null,
  hyperliquidPosition: `https://app.hyperliquid.xyz/explorer/address/${HYPERLIQUID.account}`,
  solMarket: "https://app.hyperliquid.xyz/trade/SOL",
  buy: null,
};

export type SiteLink = {
  label: string;
  href: string;
};

const optionalLinks: Array<[string, string | null]> = [
  ["Pump.fun", EXTERNAL_LINKS.pump],
  ["DexScreener", EXTERNAL_LINKS.dexScreener],
  ["X", EXTERNAL_LINKS.x],
  ["Community", EXTERNAL_LINKS.community],
  ["Hyperliquid", EXTERNAL_LINKS.hyperliquidPosition],
];

export const externalLinks: SiteLink[] = optionalLinks.flatMap(([label, href]) =>
  href ? [{ label, href }] : [],
);
