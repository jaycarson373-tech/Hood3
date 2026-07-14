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

export const topMetrics: Metric[] = [
  {
    label: "Current position",
    value: "NO POSITION",
    detail: "wallet not connected",
  },
  {
    label: "Size",
    value: "$0",
    detail: "0 HOOD",
  },
  {
    label: "Total SOL bridged",
    value: "0 SOL",
    detail: "claim rail idle",
  },
  {
    label: "HOODX price",
    value: "$0.0000",
    detail: "not trading yet",
  },
  {
    label: "Total burnt",
    value: "0",
    detail: "HOODX retired",
  },
];

export const landingStats: Metric[] = [
  {
    label: "Fee run-rate",
    value: "$0",
    detail: "awaiting live flow",
  },
  {
    label: "NLT backing",
    value: "$0.0000",
    detail: "per token",
  },
  {
    label: "Burn route",
    value: "0%",
    detail: "not active yet",
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
    title: "Claim every 15 minutes",
    text: "A Supabase scheduled worker claims eligible fee flow on a fixed 15-minute cadence and writes each attempt to the Hood3 terminal.",
  },
  {
    title: "Send to Hyperliquid",
    text: "Claimed SOL is routed to the configured Hyperliquid wallet, with transaction hashes stored before the next automation stage runs.",
  },
  {
    title: "Convert to perp collateral",
    text: "The next execution stage sells SOL to USDC, transfers collateral into the perp account, and records the settlement details.",
  },
  {
    title: "Scale the HOOD long",
    text: "The executor opens or adds to the HOOD long, then publishes NLT backing and the live flywheel state.",
  },
];

export const automationSteps: AutomationStep[] = [
  {
    label: "01",
    title: "Auto claim",
    text: "Supabase cron triggers every 15 minutes and logs claim status before funds move.",
  },
  {
    label: "02",
    title: "Auto send",
    text: "Claimed SOL routes to the configured Hyperliquid wallet and posts a scan link.",
  },
  {
    label: "03",
    title: "Auto swap",
    text: "SOL-to-USDC execution is staged for the collateral account after wallet wiring is live.",
  },
  {
    label: "04",
    title: "Auto long",
    text: "USDC moves to the perp account and the executor scales the HOOD long inside risk limits.",
  },
];

export const terminalEvents: TerminalEvent[] = [
  {
    stamp: "WAITING",
    stage: "SYSTEM",
    status: "IDLE",
    action: "No live transactions yet",
    detail: "Connect Supabase to stream claims, transfers, swaps, perp deposits, HOOD orders, and burns here.",
  },
];

export const risks = [
  "Revenue can swing with markets, crypto activity, rates, and retail trading appetite.",
  "Tokenized equities, prediction markets, perps, and event contracts remain regulatory hot zones.",
  "Growth spending, acquisitions, and convertible-note financing can pressure margins or dilution.",
  "The NLT design needs audits, risk limits, liquidation handling, and user disclosures before production.",
];

export const sourceLinks = [
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
    text: "Hood3 adds a derivative layer. NLT mechanics need audited controls before any real user capital is involved.",
  },
];

export const homePillars = [
  {
    title: "Fee pressure becomes exposure",
    text: "Hood3 treats usage as fuel: fees flow to margin, margin creates HOOD exposure, and the position is published back to the token layer.",
    icon: ArrowUpRight,
  },
  {
    title: "Burns stay visible",
    text: "HOODX burn data sits in the header instead of being buried in a modal, making supply reduction part of the product surface.",
    icon: Flame,
  },
  {
    title: "Automation with receipts",
    text: "The execution rail keeps private keys server-side while the site publishes every claim, transfer, swap, order, and burn event.",
    icon: ShieldCheck,
  },
];
