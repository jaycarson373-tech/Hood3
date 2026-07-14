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

export const topMetrics: Metric[] = [
  {
    label: "Current position",
    value: "LONG HOOD",
    detail: "3.0x cross target",
  },
  {
    label: "Size",
    value: "$1.06M",
    detail: "9,450 HOOD",
  },
  {
    label: "Total SOL bridged",
    value: "12,840 SOL",
    detail: "NLT fee rail",
  },
  {
    label: "HOODX price",
    value: "$1.184",
    detail: "+4.8% 24h",
  },
  {
    label: "Total burnt",
    value: "428.9K",
    detail: "HOODX retired",
  },
];

export const landingStats: Metric[] = [
  {
    label: "Fee run-rate",
    value: "$26.3K",
    detail: "monthly model",
  },
  {
    label: "NLT backing",
    value: "$1.0631",
    detail: "per token",
  },
  {
    label: "Burn route",
    value: "30%",
    detail: "post-margin flow",
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
    title: "Bridge SOL",
    text: "Users bridge SOL into the Hood3 fee rail. The dashboard models the bridge, HOODX price, burn count, and collateral runway.",
  },
  {
    title: "Route fees",
    text: "Protocol fees split between margin, buy-and-burn, and reserves. Governance can change the allocation and leverage caps.",
  },
  {
    title: "Hold HOOD long",
    text: "The linked Hyperliquid account is read-only. If a HOOD position exists, the dashboard publishes notional size and PnL.",
  },
  {
    title: "Publish NLT backing",
    text: "NLT displays the long notional, backing per token, refill rate, and margin stress so users can understand the flywheel.",
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
    title: "Read-only by default",
    text: "The account link reads public Hyperliquid state only. No signing, custody, or order placement exists in this prototype.",
    icon: ShieldCheck,
  },
];
