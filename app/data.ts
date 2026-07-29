import type { LucideIcon } from "lucide-react";
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Flame,
  Landmark,
  Scale,
  ShieldCheck,
} from "lucide-react";

export type Metric = {
  label: string;
  value: string;
  detail: string;
};

export type MandatePoint = {
  label: string;
  value: string;
  text: string;
  icon: LucideIcon;
};

export const mandatePoints: MandatePoint[] = [
  {
    label: "Capital formation",
    value: "01",
    text: "Creator fees form the capital base for a transparent Hyperliquid short book.",
    icon: Landmark,
  },
  {
    label: "Short the excess",
    value: "02",
    text: "The mandate targets AI and technology blue chips it identifies as materially overvalued.",
    icon: Scale,
  },
  {
    label: "Token alignment",
    value: "03",
    text: "Qualifying realized profit may purchase and permanently burn $HEDGE.",
    icon: Flame,
  },
];

export const strategySteps = [
  {
    number: "01",
    title: "Fees fund the mandate",
    text: "Creator fees are checked on a fixed cadence and routed into the public Hyperliquid account.",
    icon: BriefcaseBusiness,
  },
  {
    number: "02",
    title: "The fund opens shorts",
    text: "Capital builds disclosed short positions in selected AI and technology blue chips.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Profit buys scarcity",
    text: "Qualifying realized profit returns to Solana, buys $HEDGE, and permanently burns it.",
    icon: ArrowDownUp,
  },
];

export const automationSteps = [
  {
    label: "01",
    title: "Collect",
    text: "Check creator fees and preserve the configured transaction buffer.",
  },
  {
    label: "02",
    title: "Bridge",
    text: "Route deployable capital to the public Hyperliquid account.",
  },
  {
    label: "03",
    title: "Short",
    text: "Open and maintain selected equity perpetual shorts within explicit risk limits.",
  },
  {
    label: "04",
    title: "Return",
    text: "Route qualifying realized profit toward buybacks and permanent burns.",
  },
];

export const roadmap = [
  ["Phase I", "Fund the Book", "Establish transparent fee routing and public receipts."],
  ["Phase II", "Scale Shorts", "Grow disclosed AI and technology shorts inside explicit risk limits."],
  ["Phase III", "Buybacks", "Convert qualifying realized profit into permanent supply reduction."],
  ["Phase IV", "Institutional Domination", "Make the best-dressed hedge fund on Solana impossible to ignore."],
];

export const risks = [
  "Short positions can lose money quickly or be liquidated when the underlying market rises.",
  "A concentrated AI and technology short book can experience correlated losses and short squeezes.",
  "Bridges, exchanges, wallets, and automation can fail or experience delays.",
  "Buybacks and burns require qualifying realized profit and are never guaranteed.",
  "$HEDGE is a highly speculative community token and can lose most or all of its value.",
];
