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

export const longcatTicker = "$LONGCAT";
export const cashcatTicker = "$CASHCAT";
export const longcatXUrl = "#x";
export const longcatChartUrl = "#chart";
export const longcatContractUrl = "/LongcatToken.sol";
export const cashcatChartUrl = "#cashcat-chart";
export const publicPositionAccount = "0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f";
export const publicPositionAccountShort = "0xdF09...f45f";
export const publicPositionScanUrl = `https://hypurrscan.io/address/${publicPositionAccount}`;

export const topMetrics: Metric[] = [
  {
    label: "Cashcat Long",
    value: "$0",
    detail: "awaiting integration",
  },
  {
    label: "Current Leverage",
    value: "0.00x",
    detail: "risk controls offline",
  },
  {
    label: "Total Fees Deployed",
    value: "$0",
    detail: "2% creator fee",
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
    label: "Cashcat Long",
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
    detail: "2% fee extends the long",
  },
  {
    label: "$LONGCAT Burned",
    value: "0",
    detail: "supply removed",
  },
];

export const livePositionStats: Metric[] = [
  { label: "POSITION SIZE", value: "Awaiting live integration.", detail: "public position" },
  { label: "TOTAL FEES DEPLOYED", value: "Awaiting live integration.", detail: "2% creator fee" },
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
    text: "Every transaction generates the 2% creator fee.",
  },
  {
    label: "02",
    title: "Fees long $CASHCAT",
    text: "100% of the 2% creator fee is strategically deployed into the public Cashcat position.",
  },
  {
    label: "03",
    title: "Profits buy $LONGCAT",
    text: "Realized trading profits are used to market-buy the native token.",
  },
  {
    label: "04",
    title: "$LONGCAT is burned",
    text: "Every purchased token is permanently removed from circulation.",
  },
  {
    label: "05",
    title: "Repeat",
    text: "More trading creates more exposure, more potential buybacks, and a smaller supply.",
  },
];

export const timeline = [
  {
    label: "2005",
    title: "Longcat is born",
    text: "The internet meets Shiro, the rescue cat from Japan with an impossibly long body.",
  },
  {
    label: "2026",
    title: "Longcat enters Robinhood",
    text: "$LONGCAT turns meme length into directional Cashcat exposure.",
  },
  {
    label: "Forever",
    title: "The long keeps extending",
    text: "Every fee makes the long longer. Every realized winning trade can make supply shorter.",
  },
];

export const cashcatThesisPoints: ThesisPoint[] = [
  {
    label: "Retail rail",
    value: "01",
    text: "Robinhood is bringing new retail onchain.",
    icon: TrendingUp,
  },
  {
    label: "Native memes",
    value: "02",
    text: "Native ecosystems produce native memes.",
    icon: Sparkles,
  },
  {
    label: "Defining cat",
    value: "03",
    text: "Our thesis is Cashcat becomes Robinhood's defining cat.",
    icon: BadgeDollarSign,
  },
];

export const howItWorks = [
  {
    title: "Creator fees accumulate",
    text: "Trading activity creates the 2% creator fee for the Longcat mechanism.",
  },
  {
    title: "Fees extend Cashcat",
    text: "100% of the 2% creator fee allocated to the protocol is strategically deployed into the public $CASHCAT long.",
  },
  {
    title: "Profit is realized",
    text: "When the position generates qualifying realized gains, those gains become buyback fuel.",
  },
  {
    title: "Longcat gets shorter",
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
    text: "Fees strategically add to the public Cashcat long inside execution and risk limits.",
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
    detail: "Live receipts will stream creator fees, Cashcat long orders, realized profit, $LONGCAT buybacks, and burns here.",
  },
];

export const risks = [
  "Leveraged trading can lose money quickly, including through liquidation.",
  "Cashcat, Robinhood Chain, memecoins, and tokenized markets can face sharp volatility and regulatory review.",
  "Buybacks and burns only occur when qualifying realized profits exist; they are not guaranteed.",
  "Execution, liquidity, slippage, automation, and wallet operations need audited controls before full automation.",
];

export const sourceLinks = [
  {
    label: "X",
    href: longcatXUrl,
  },
  {
    label: "Chart",
    href: longcatChartUrl,
  },
  {
    label: "Contract",
    href: longcatContractUrl,
  },
  {
    label: "Position",
    href: publicPositionScanUrl,
  },
  {
    label: "Burns",
    href: "/#burns",
  },
];

export const thesisRisks = [
  {
    label: "Market risk",
    text: "Cashcat can move against the position. A long thesis is not a guarantee.",
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
    text: "The thesis assumes Cashcat remains culturally relevant as Robinhood-linked onchain activity grows.",
  },
];

export const homePillars = [
  {
    title: "Creator fees extend Cashcat",
    text: "Every 2% creator fee allocated to the protocol strategically extends one public leveraged long on $CASHCAT.",
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
    answer: "$LONGCAT is a native leverage token whose 2% creator fee is deployed into a public leveraged long position on Cashcat.",
  },
  {
    question: "Where do creator fees go?",
    answer: "100% of the 2% creator fee allocated to the protocol is strategically deployed into the Cashcat position, subject to execution, risk controls and operating conditions.",
  },
  {
    question: "What happens to trading profits?",
    answer: "Realized profits designated by the mechanism are used to buy $LONGCAT from the market and permanently burn the purchased tokens.",
  },
  {
    question: "Are profits or burns guaranteed?",
    answer: "No. Leveraged trading involves significant risk. The Cashcat position can lose money, and buybacks only occur when qualifying realized profits exist.",
  },
  {
    question: "Can the position be liquidated?",
    answer: "Yes. Any leveraged position carries liquidation risk. The position, leverage and liquidation level should be displayed publicly whenever integrations are available.",
  },
  {
    question: "Why Cashcat?",
    answer: "Our thesis is that Cashcat can become one of the defining native memes of the Robinhood ecosystem as Robinhood brings more retail activity onchain.",
  },
  {
    question: "Is this affiliated with Robinhood or Cashcat?",
    answer: "$LONGCAT is an independent community project and is not affiliated with or endorsed by Robinhood, Cashcat, Shiro, Longcat's original creators or any referenced third party.",
  },
];
