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

export const hood3Ticker = "$HOOD3";
export const hoodTicker = "HOOD";
export const hood3XUrl = "https://x.com/HOOD3pf";
export const hood3ChartUrl = "#chart";
export const hood3ContractUrl = "/Hood3Token.sol";
export const hoodChartUrl = "#hood-chart";
export const lighterUrl = "https://lighter.xyz/";

export const topMetrics: Metric[] = [
  {
    label: "HOOD Long",
    value: "$0",
    detail: "Lighter integration pending",
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
    label: "$HOOD3 Burned",
    value: "0",
    detail: "permanent removal",
  },
];

export const landingStats: Metric[] = [
  {
    label: "HOOD Long",
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
    label: "$HOOD3 Burned",
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
    title: "$HOOD3 trades",
    text: "Every transaction generates the 2% creator fee.",
  },
  {
    label: "02",
    title: "Fees long HOOD",
    text: "100% of protocol creator fees are designed to build a public HOOD long on Lighter.",
  },
  {
    label: "03",
    title: "Profits buy $HOOD3",
    text: "Qualifying realized trading profits can market-buy the native token.",
  },
  {
    label: "04",
    title: "$HOOD3 is burned",
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
    label: "Robinhood Chain",
    title: "Retail moves onchain",
    text: "Hood3 is built around the thesis that Robinhood-native rails can pull a new retail class into onchain markets.",
  },
  {
    label: "Lighter",
    title: "The leverage layer",
    text: "Lighter provides the perp venue Hood3 is designed to use for transparent HOOD exposure.",
  },
  {
    label: "Flywheel",
    title: "Fees become direction",
    text: "Creator fees build exposure; realized profits can buy and burn $HOOD3.",
  },
];

export const hoodThesisPoints: ThesisPoint[] = [
  {
    label: "Retail rail",
    value: "01",
    text: "Robinhood Chain can bring mainstream retail directly onchain.",
    icon: TrendingUp,
  },
  {
    label: "Native equity",
    value: "02",
    text: "HOOD is the clean directional proxy for Robinhood's own onchain expansion.",
    icon: Sparkles,
  },
  {
    label: "Lighter execution",
    value: "03",
    text: "Hood3 turns token activity into transparent Lighter-based HOOD exposure.",
    icon: BadgeDollarSign,
  },
];

export const howItWorks = [
  {
    title: "Creator fees accumulate",
    text: "Trading activity creates the 2% creator fee for the Hood3 mechanism.",
  },
  {
    title: "Fees build the HOOD long",
    text: "100% of the 2% creator fee allocated to the protocol is designed to add to the public HOOD long on Lighter.",
  },
  {
    title: "Profit is realized",
    text: "When the position generates qualifying realized gains, those gains become buyback fuel.",
  },
  {
    title: "Hood3 supply contracts",
    text: "Realized trading profits buy back $HOOD3 and permanently burn the purchased tokens.",
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
    text: "Fees strategically add to the public HOOD long on Lighter inside execution and risk limits.",
  },
  {
    label: "03",
    title: "Harvest gains",
    text: "Qualifying realized profit is separated from the position and queued for buybacks.",
  },
  {
    label: "04",
    title: "Buy and burn",
    text: "Profit buys $HOOD3 on market and permanently removes it from supply.",
  },
];

export const terminalEvents: TerminalEvent[] = [
  {
    stamp: "WAITING",
    stage: "SYSTEM",
    status: "IDLE",
    action: "No live transactions yet",
    detail: "Live receipts will stream creator fees, Lighter HOOD orders, realized profit, $HOOD3 buybacks, and burns here.",
  },
];

export const risks = [
  "Leveraged trading can lose money quickly, including through liquidation.",
  "HOOD, Robinhood Chain, memecoins, and tokenized markets can face sharp volatility and regulatory review.",
  "Buybacks and burns only occur when qualifying realized profits exist; they are not guaranteed.",
  "Execution, liquidity, slippage, automation, and wallet operations need audited controls before full automation.",
];

export const sourceLinks = [
  {
    label: "X",
    href: hood3XUrl,
  },
  {
    label: "Chart",
    href: hood3ChartUrl,
  },
  {
    label: "Contract",
    href: hood3ContractUrl,
  },
  {
    label: "Lighter",
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
    text: "HOOD can move against the position. A long thesis is not a guarantee.",
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
    text: "The thesis assumes Robinhood Chain and Lighter-linked onchain activity keep expanding.",
  },
];

export const homePillars = [
  {
    title: "Creator fees long HOOD",
    text: "Every 2% creator fee allocated to the protocol is designed to extend one public leveraged HOOD position on Lighter.",
    icon: StretchHorizontal,
  },
  {
    title: "Winning trades create scarcity",
    text: "Realized trading profits buy back $HOOD3 and permanently burn it.",
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
    question: "What is $HOOD3?",
    answer: "$HOOD3 is a Robinhood Chain native leverage token designed to route its 2% creator fee into a public leveraged HOOD position on Lighter.",
  },
  {
    question: "Where do creator fees go?",
    answer: "100% of the 2% creator fee allocated to the protocol is designed to build the HOOD long, subject to execution, risk controls and operating conditions.",
  },
  {
    question: "What happens to trading profits?",
    answer: "Qualifying realized profits designated by the mechanism are used to buy $HOOD3 from the market and permanently burn the purchased tokens.",
  },
  {
    question: "Are profits or burns guaranteed?",
    answer: "No. Leveraged trading involves significant risk. The HOOD position can lose money, and buybacks only occur when qualifying realized profits exist.",
  },
  {
    question: "Can the position be liquidated?",
    answer: "Yes. Any leveraged position carries liquidation risk. The position, leverage and liquidation level should be displayed publicly whenever integrations are available.",
  },
  {
    question: "Why HOOD?",
    answer: "Our thesis is that HOOD is the cleanest directional expression of Robinhood's own onchain expansion.",
  },
  {
    question: "Is this affiliated with Robinhood or Lighter?",
    answer: "$HOOD3 is an independent community project and is not affiliated with or endorsed by Robinhood Markets, Lighter, or any referenced third party.",
  },
];
