import {
  BadgeDollarSign,
  Flame,
  ShieldCheck,
  Sparkles,
  StretchHorizontal,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type ThesisPoint = {
  label: string;
  value: string;
  text: string;
  icon: LucideIcon;
};

export type AutomationStep = {
  label: string;
  title: string;
  text: string;
};

export type TerminalEvent = {
  stamp: string;
  stage: string;
  status: string;
  action: string;
  detail: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const hood3Ticker = "$LONGCAT";
export const hoodTicker = "SOL";
export const hood3XUrl = "https://x.com/LongcatRH_";
export const hood3ChartUrl = "#chart";
export const hood3ContractUrl = "/#buy-longcat";
export const hoodChartUrl = "https://app.hyperliquid.xyz/trade/SOL";
export const lighterUrl = "https://app.hyperliquid.xyz/";
export const pumpFunUrl = "https://pump.fun/";
export const dexScreenerUrl = "https://dexscreener.com/solana";
export const communityUrl = "https://x.com/i/communities";

export const topMetrics: Metric[] = [
  {
    label: "SOL Long",
    value: "$0",
    detail: "Hyperliquid integration pending",
  },
  {
    label: "Current Leverage",
    value: "0.00x",
    detail: "risk controls offline",
  },
  {
    label: "Total Fees Deployed",
    value: "$0",
    detail: "creator fees",
  },
  {
    label: "Realized Profit",
    value: "$0",
    detail: "buyback fuel",
  },
  {
    label: "$LONGCAT Burned",
    value: "0",
    detail: "permanent removal",
  },
];

export const landingStats: Metric[] = [
  {
    label: "SOL Long",
    value: "$0",
    detail: "public position",
  },
  {
    label: "Current Leverage",
    value: "0.00x",
    detail: "awaiting execution",
  },
  {
    label: "Total Fees Deployed",
    value: "$0",
    detail: "fees extend the long",
  },
  {
    label: "$LONGCAT Burned",
    value: "0",
    detail: "supply removed",
  },
];

export const livePositionStats: Metric[] = [
  { label: "POSITION SIZE", value: "Awaiting live integration.", detail: "public SOL long" },
  { label: "TOTAL FEES DEPLOYED", value: "Awaiting live integration.", detail: "creator fees" },
  { label: "ENTRY PRICE", value: "Awaiting live integration.", detail: "execution data" },
  { label: "CURRENT PRICE", value: "Awaiting live integration.", detail: "market data" },
  { label: "LEVERAGE", value: "Awaiting live integration.", detail: "risk data" },
  { label: "UNREALIZED PNL", value: "Awaiting live integration.", detail: "position data" },
  { label: "REALIZED PROFIT", value: "Awaiting live integration.", detail: "buyback fuel" },
  { label: "TOTAL BUYBACKS", value: "Awaiting live integration.", detail: "receipts" },
  { label: "TOTAL TOKENS BURNED", value: "Awaiting live integration.", detail: "burn receipts" },
  { label: "LAST POSITION UPDATE", value: "Awaiting live integration.", detail: "latest receipt" },
];

export const burnStats: Metric[] = [
  { label: "TOTAL BUYBACKS", value: "Awaiting live integration.", detail: "realized profits" },
  { label: "TOTAL TOKENS BURNED", value: "Awaiting live integration.", detail: "burn receipts" },
  { label: "REALIZED PROFIT", value: "Awaiting live integration.", detail: "buyback fuel" },
  { label: "LAST POSITION UPDATE", value: "Awaiting live integration.", detail: "latest receipt" },
];

export const flywheelSteps: AutomationStep[] = [
  {
    label: "01",
    title: "$LONGCAT trades",
    text: "Every transaction generates creator fees for the mechanism.",
  },
  {
    label: "02",
    title: "Fees long SOL",
    text: "100% of protocol creator fees are designed to build a public SOL long on Hyperliquid.",
  },
  {
    label: "03",
    title: "Profits buy $LONGCAT",
    text: "Qualifying realized trading profits can market-buy the native token.",
  },
  {
    label: "04",
    title: "$LONGCAT is burned",
    text: "Every purchased token is permanently removed from circulation.",
  },
  {
    label: "05",
    title: "Repeat",
    text: "More trading creates more SOL exposure, more potential buybacks, and a smaller supply.",
  },
];

export const timeline = [
  {
    label: "Solana",
    title: "Retail moves at speed",
    text: "Longcat is built around the thesis that Solana remains the fastest retail arena for meme-native speculation.",
  },
  {
    label: "Hyperliquid",
    title: "The leverage layer",
    text: "Hyperliquid provides the perp venue Longcat is designed to use for transparent SOL exposure.",
  },
  {
    label: "Flywheel",
    title: "Fees become direction",
    text: "Creator fees build exposure; realized profits can buy and burn $LONGCAT.",
  },
];

export const hoodThesisPoints: ThesisPoint[] = [
  {
    label: "Fast retail rail",
    value: "01",
    text: "Solana has become one of crypto's clearest retail venues: fast, liquid, meme-native, and relentlessly online.",
    icon: TrendingUp,
  },
  {
    label: "Native asset",
    value: "02",
    text: "SOL is the clean directional expression of Solana network activity, liquidity, and attention.",
    icon: Sparkles,
  },
  {
    label: "Hyperliquid execution",
    value: "03",
    text: "Longcat turns token activity into a transparent Hyperliquid-based SOL long.",
    icon: BadgeDollarSign,
  },
];

export const howItWorks = [
  {
    title: "Creator fees accumulate",
    text: "Trading activity creates fees for the Longcat mechanism.",
  },
  {
    title: "Fees build the SOL long",
    text: "100% of creator fees allocated to the protocol are designed to add to the public SOL long on Hyperliquid.",
  },
  {
    title: "Profit is realized",
    text: "When the position generates qualifying realized gains, those gains become buyback fuel.",
  },
  {
    title: "Longcat supply contracts",
    text: "Realized trading profits buy back $LONGCAT and permanently burn the purchased tokens.",
  },
];

export const automationSteps: AutomationStep[] = [
  {
    label: "01",
    title: "Collect fees",
    text: "Creator fee receipts enter the public terminal before funds move.",
  },
  {
    label: "02",
    title: "Extend the long",
    text: "Fees strategically add to the public SOL long on Hyperliquid inside execution and risk limits.",
  },
  {
    label: "03",
    title: "Harvest gains",
    text: "Qualifying realized profit is separated from the position and queued for buybacks.",
  },
  {
    label: "04",
    title: "Buy and burn",
    text: "Profit buys $LONGCAT on market and permanently removes it from supply.",
  },
];

export const terminalEvents: TerminalEvent[] = [
  {
    stamp: "WAITING",
    stage: "SYSTEM",
    status: "IDLE",
    action: "No live transactions yet",
    detail: "Live receipts will stream creator fees, Hyperliquid SOL orders, realized profit, $LONGCAT buybacks, and burns here.",
  },
];

export const risks = [
  "Leveraged trading can lose money quickly, including through liquidation.",
  "SOL, Solana memecoins, perp venues, and token markets can face sharp volatility and regulatory review.",
  "Buybacks and burns only occur when qualifying realized profits exist; they are not guaranteed.",
  "Execution, liquidity, slippage, automation, and wallet operations need audited controls before full automation.",
];

export const sourceLinks = [
  {
    label: "Pump.fun",
    href: pumpFunUrl,
  },
  {
    label: "Dexscreener",
    href: dexScreenerUrl,
  },
  {
    label: "X",
    href: hood3XUrl,
  },
  {
    label: "Community",
    href: communityUrl,
  },
  {
    label: "CA soon",
    href: hood3ContractUrl,
  },
  {
    label: "Hyperliquid",
    href: lighterUrl,
  },
  {
    label: "Burns",
    href: "/#burns",
  },
];

export const thesisRisks = [
  {
    label: "Market risk",
    text: "SOL can move against the position. A long thesis is not a guarantee.",
  },
  {
    label: "Liquidation risk",
    text: "Any leveraged position can be liquidated if collateral and risk controls are not managed.",
  },
  {
    label: "Execution risk",
    text: "The mechanism depends on swaps, perp execution, buybacks, burns, receipts, and automation working correctly.",
  },
  {
    label: "Narrative risk",
    text: "The thesis assumes Solana liquidity, retail attention, and Hyperliquid execution remain strong.",
  },
];

export const homePillars = [
  {
    title: "Creator fees long SOL",
    text: "Every creator fee allocated to the protocol is designed to extend one public leveraged SOL position on Hyperliquid.",
    icon: StretchHorizontal,
  },
  {
    title: "Winning trades create scarcity",
    text: "Realized trading profits buy back $LONGCAT and permanently burn it.",
    icon: Flame,
  },
  {
    title: "Public by design",
    text: "The position, receipts, and burns are built to be visible once live integrations are connected.",
    icon: ShieldCheck,
  },
];

export const faqItems: FaqItem[] = [
  {
    question: "What is $LONGCAT?",
    answer: "$LONGCAT is a Solana native leverage token designed to route creator fees into a public leveraged SOL position on Hyperliquid.",
  },
  {
    question: "Where do creator fees go?",
    answer: "100% of creator fees allocated to the protocol are designed to build the SOL long, subject to execution, risk controls, and operating conditions.",
  },
  {
    question: "What happens to trading profits?",
    answer: "Qualifying realized profits designated by the mechanism are used to buy $LONGCAT from the market and permanently burn the purchased tokens.",
  },
  {
    question: "Are profits or burns guaranteed?",
    answer: "No. Leveraged trading involves significant risk. The SOL position can lose money, and buybacks only occur when qualifying realized profits exist.",
  },
  {
    question: "Can the position be liquidated?",
    answer: "Yes. Any leveraged position carries liquidation risk. The position, leverage, and liquidation level should be displayed publicly whenever integrations are available.",
  },
  {
    question: "Why SOL?",
    answer: "Our thesis is that SOL is the cleanest directional expression of Solana activity, liquidity, and retail attention.",
  },
  {
    question: "Is this affiliated with Solana or Hyperliquid?",
    answer: "$LONGCAT is an independent community project and is not affiliated with or endorsed by Solana Foundation, Hyperliquid, or any referenced third party.",
  },
];
