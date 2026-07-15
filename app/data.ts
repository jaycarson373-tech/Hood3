import {
  Activity,
  ArrowUpRight,
  Flame,
  Layers3,
  Repeat2,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  Zap,
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

export const hood3XUrl = "https://x.com/HOOD3pf";
export const hood3HyperliquidAccount = "0xdF099e764bB99654a7BaE0c0FE89bD8b86ABf45f";
export const hood3HyperliquidAccountShort = "0xdF09...f45f";
export const hood3HyperliquidScanUrl = `https://hypurrscan.io/address/${hood3HyperliquidAccount}`;

export const topMetrics: Metric[] = [
  {
    label: "Desk position",
    value: "FLAT",
    detail: "HOOD long idle",
  },
  {
    label: "Current HOOD long",
    value: "$0",
    detail: `HL ${hood3HyperliquidAccountShort}`,
  },
  {
    label: "Fees deployed",
    value: "$0",
    detail: "100% creator fees",
  },
  {
    label: "Realized profit",
    value: "$0",
    detail: "awaiting close",
  },
  {
    label: "HOOD3 bought back",
    value: "$0",
    detail: "market buyback",
  },
  {
    label: "HOOD3 burned",
    value: "0",
    detail: "permanent burn",
  },
];

export const landingStats: Metric[] = [
  {
    label: "Current HOOD long",
    value: "$0",
    detail: "public Hyperliquid account",
  },
  {
    label: "Fees deployed",
    value: "$0",
    detail: "100% of creator fees",
  },
  {
    label: "Realized profit",
    value: "$0",
    detail: "buyback fuel",
  },
  {
    label: "HOOD3 burned",
    value: "0",
    detail: "permanent supply removal",
  },
];

export const thesisPoints: ThesisPoint[] = [
  {
    label: "Deposit engine",
    value: "$377B",
    text: "Robinhood reported 27.7M funded customers, $377B in Total Platform Assets, and 27% LTM net deposit growth as of May 31, 2026.",
    icon: WalletCards,
  },
  {
    label: "Trading intensity",
    value: "$315B",
    text: "May equity notional volume rose 75% year over year, options contracts grew 29%, and event contracts reached 3.9B.",
    icon: Activity,
  },
  {
    label: "Interest flywheel",
    value: "$19.5B",
    text: "Margin balances were $19.5B in May, up 117% year over year, while cash and deposits rose 54%.",
    icon: Repeat2,
  },
  {
    label: "Monetization",
    value: "$1.07B",
    text: "Q1 2026 revenue grew 15% year over year, adjusted EBITDA grew 14%, and Gold subscribers reached 4.3M.",
    icon: TrendingUp,
  },
  {
    label: "Product velocity",
    value: "100M+",
    text: "Robinhood said its public Robinhood Chain testnet processed over 100M transactions while it pushes tokenization and global brokerage.",
    icon: Zap,
  },
  {
    label: "Optionality",
    value: "24/7",
    text: "Tokenization, event contracts, futures, crypto, advisory, retirement, and banking widen the number of ways a user can become a power user.",
    icon: Layers3,
  },
];

export const howItWorks = [
  {
    title: "Capture creator fees",
    text: "Creator fees are collected by the execution rail and written to the Hood3 terminal as public receipts.",
  },
  {
    title: "Deploy into HOOD",
    text: "The NLT Flywheel deploys 100% of creator fees into a public HOOD long on Hyperliquid.",
  },
  {
    title: "Realize profit",
    text: "When the long realizes profit, that profit becomes the buyback budget for the next stage.",
  },
  {
    title: "Buy and burn HOOD3",
    text: "Realized profits market buy HOOD3 and permanently burn the tokens, reducing supply.",
  },
];

export const automationSteps: AutomationStep[] = [
  {
    label: "01",
    title: "Capture fees",
    text: "Creator fee receipts enter the public terminal before funds move.",
  },
  {
    label: "02",
    title: "Open HOOD long",
    text: "Fees deploy into the public Hyperliquid HOOD long account.",
  },
  {
    label: "03",
    title: "Harvest profit",
    text: "Realized profit is separated from the long and queued for buybacks.",
  },
  {
    label: "04",
    title: "Buy and burn",
    text: "Profit buys HOOD3 on market and permanently removes it from supply.",
  },
];

export const terminalEvents: TerminalEvent[] = [
  {
    stamp: "WAITING",
    stage: "SYSTEM",
    status: "IDLE",
    action: "No live transactions yet",
    detail: "Live receipts will stream creator fees, HOOD long orders, realized profit, HOOD3 buybacks, and burns here.",
  },
];

export const risks = [
  "Revenue can swing with markets, crypto activity, rates, and retail trading appetite.",
  "Tokenized equities, prediction markets, perps, and event contracts remain regulatory hot zones.",
  "Growth spending, acquisitions, and convertible-note financing can pressure margins or dilution.",
  "The NLT Flywheel needs audits, risk limits, liquidation handling, and user disclosures before production.",
];

export const sourceLinks = [
  {
    label: "Hood3 Hyperliquid account",
    href: hood3HyperliquidScanUrl,
  },
  {
    label: "Robinhood IR overview",
    href: "https://investors.robinhood.com/",
  },
  {
    label: "May 2026 operating data",
    href: "https://investors.robinhood.com/news-releases/news-release-details/robinhood-markets-inc-reports-may-2026-operating-data",
  },
  {
    label: "Q1 2026 results",
    href: "https://investors.robinhood.com/news-releases/news-release-details/robinhood-reports-first-quarter-2026-results",
  },
  {
    label: "Hyperliquid account API",
    href: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals",
  },
];

export const thesisRisks = [
  {
    label: "Market sensitivity",
    text: "HOOD remains sensitive to trading volumes, rate cycles, crypto drawdowns, and risk appetite.",
  },
  {
    label: "Regulatory overhang",
    text: "Prediction markets, tokenized stocks, and perpetuals can attract complex regulatory review.",
  },
  {
    label: "Execution risk",
    text: "The bull case assumes Robinhood keeps shipping fast while scaling compliance, reliability, and cross-product conversion.",
  },
  {
    label: "Leverage risk",
    text: "Hood3 adds a derivative layer. NLT Flywheel mechanics need audited controls before any real user capital is involved.",
  },
];

export const homePillars = [
  {
    title: "Creator fees become exposure",
    text: "The NLT Flywheel sends creator fees into a public HOOD long instead of leaving the mechanism opaque.",
    icon: ArrowUpRight,
  },
  {
    title: "Profits buy and burn",
    text: "Realized profit becomes market buy pressure for HOOD3, then permanently removes those tokens from supply.",
    icon: Flame,
  },
  {
    title: "Automation with receipts",
    text: "The terminal keeps the flow legible: fees, HOOD long orders, realized profit, HOOD3 buybacks, and burns.",
    icon: ShieldCheck,
  },
];
