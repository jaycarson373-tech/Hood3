import {
  BadgeDollarSign,
  Sparkles,
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

export const solThesisPoints: ThesisPoint[] = [
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
    title: "Creator fees claim",
    text: "The worker is designed to check and claim creator fees every 15 minutes.",
  },
  {
    title: "SOL bridges to Hyperliquid",
    text: "Routeable SOL above the 0.05 SOL buffer is queued for Hyperliquid execution.",
  },
  {
    title: "The SOL long scales",
    text: "The automation is structured to add to the public SOL long and record every order.",
  },
  {
    title: "Profit buys and burns",
    text: "Qualifying realized profits bridge back, buy $LONGCAT, and permanently burn the purchased tokens.",
  },
];

export const automationSteps: AutomationStep[] = [
  {
    label: "01",
    title: "Claim fees",
    text: "Every 15 minutes, the worker checks the fee wallet and records the claim stage.",
  },
  {
    label: "02",
    title: "Bridge SOL",
    text: "It keeps the 0.05 SOL buffer untouched and routes the remainder toward Hyperliquid.",
  },
  {
    label: "03",
    title: "Long SOL",
    text: "The execution rail is structured to scale into SOL and record the public position.",
  },
  {
    label: "04",
    title: "Take profit + burn",
    text: "Qualifying profit bridges back, buys $LONGCAT, and publishes permanent burn receipts.",
  },
];

export const risks = [
  "Leveraged trading can lose money quickly, including through liquidation.",
  "SOL, Solana memecoins, perp venues, and token markets can face sharp volatility and regulatory review.",
  "Buybacks and burns only occur when qualifying realized profits exist; they are not guaranteed.",
  "Execution, liquidity, slippage, automation, and wallet operations need audited controls before full automation.",
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
